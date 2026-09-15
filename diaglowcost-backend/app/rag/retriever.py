from pathlib import Path
from sentence_transformers import SentenceTransformer
import chromadb

from app.core.config import get_settings
from app.rag.corpus import read_tsv, row_to_document


class Retriever:
    def __init__(self):
        self.settings = get_settings()

        self.model = SentenceTransformer(
            self.settings.embedding_model
        )

        chroma_path = Path(self.settings.chroma_dir)

        self.client = chromadb.PersistentClient(
            path=str(chroma_path)
        )

        self.collection = self.client.get_or_create_collection(
            name=self.settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )

    @property
    def ready(self):
        return self.collection.count() > 0

    @property
    def count(self):
        return self.collection.count()

    @property
    def dimension(self):
        return self.model.get_sentence_embedding_dimension()

    def build(self):
        rows = read_tsv(self.settings.train_data)

        documents = [
            row_to_document(row)
            for row in rows
        ]

        ids = [
            str(i)
            for i in range(len(documents))
        ]

        # Recréer proprement la collection
        try:
            self.client.delete_collection(
                self.settings.chroma_collection
            )
        except Exception:
            pass

        self.collection = self.client.get_or_create_collection(
            name=self.settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )

        batch_size = 256

        for start in range(0, len(documents), batch_size):
            end = min(
                start + batch_size,
                len(documents)
            )

            batch_docs = documents[start:end]
            batch_ids = ids[start:end]

            embeddings = self.model.encode(
                batch_docs,
                normalize_embeddings=True,
                show_progress_bar=True,
            )

            embeddings = embeddings.tolist()

            self.collection.add(
                ids=batch_ids,
                documents=batch_docs,
                embeddings=embeddings,
                metadatas=[
                    rows[i]
                    for i in range(start, end)
                ],
            )

        return len(rows), self.dimension

    def search(self, query: str, top_k: int = 5):

        if not self.ready:
            raise RuntimeError(
                "RAG index not built. Run scripts/build_index.py"
            )

        query_embedding = self.model.encode(
            [query],
            normalize_embeddings=True,
        )[0].tolist()

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, self.count),
            include=[
                "documents",
                "metadatas",
                "distances",
            ],
        )

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        output = []

        for document, metadata, distance in zip(
            documents,
            metadatas,
            distances,
        ):
            # Chroma cosine distance = 1 - cosine similarity
            score = 1.0 - float(distance)

            output.append({
                **metadata,
                "score": score,
                "document": document,
            })

        return output