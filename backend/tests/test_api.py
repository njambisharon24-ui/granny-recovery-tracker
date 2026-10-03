from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_get_observations_returns_seed_data():
    response = client.get('/observations')
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 1
    assert payload[0]['date']


def test_create_observation():
    payload = {
        'date': '2026-10-02',
        'mobility': 'Improving',
        'speech': 'Clearer',
        'exercises_done': True,
        'medication_taken': True,
        'blood_pressure': '122/80',
        'notes': 'Improved appetite after exercise session.',
    }

    response = client.post('/observations', json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body['message'] == 'observation recorded'
    assert body['observation']['date'] == '2026-10-02'


def test_demo_login_and_summary():
    login_response = client.post(
        '/auth/login',
        json={'email': 'caregiver@example.com', 'password': 'password123'},
    )
    assert login_response.status_code == 200
    assert 'token' in login_response.json()

    summary_response = client.get('/summary')
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert 'risk_level' in summary
    assert 'total_entries' in summary
