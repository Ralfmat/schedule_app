# Schedule App

Schedule App to aplikacja internetowa do planowania harmonogramów pracy,
zbudowana w architekturze SPA z wykorzystaniem Django jako RESTful API i React.js jako frontendowej części aplikacji.

## Technologie

### Backend:
- **Django** – framework do budowy aplikacji webowych w Pythonie.
- **Django Rest Framework (DRF)** – rozszerzenie Django do tworzenia RESTful API.
- **PostgreSQL** – relacyjna baza danych używana do przechowywania danych aplikacji.
- **JWT (JSON Web Token)** – mechanizm uwierzytelniania użytkowników.
- **Docker** – konteneryzacja aplikacji.

## Instalacja i uruchomienie backendu

### Wymagania wstępne
- Python 3.10+
- PostgreSQL
- Docker & Docker Compose (opcjonalnie)

### Instalacja lokalna
1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/Ralfmat/schedule_app.git
   cd schedule_app/backend
   ```
2. Utwórz wirtualne środowisko:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate  # Windows
   ```
3. Zainstaluj zależności:
   ```bash
   pip install -r requirements.txt
   ```
4. Wykonaj migracje bazy danych:
   ```bash
   python manage.py migrate
   ```
5. Uruchom serwer aplikacji:
   ```bash
   python manage.py runserver
   ```

### Uruchomienie z Dockerem

Jeśli chcesz uruchomić backend w kontenerze Docker, użyj:
```bash
cd backend
docker-compose up --build
```

## Autor
Mateusz Wanda

## Licencja
Projekt jest udostępniany na licencji MIT.
