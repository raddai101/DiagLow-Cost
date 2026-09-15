from app.api.schemas import ChatRequest, SearchRequest

def test_search_contract():
    x = SearchRequest(query='enalapril', top_k=5)
    assert x.top_k == 5

def test_chat_contract():
    x = ChatRequest(session_id='00000000-0000-0000-0000-000000000000', message='test')
    assert x.message == 'test'
