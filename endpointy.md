## AuthController
api/[...]
   - /register (POST)\
   rejestruje podanego użytkownika\
   zwraca web token
   - /login (POST)\
   loguje użytkownika\
   zwraca web token
   - /refresh (POST)\
   odświeża web token przez refresh token\
   zwraca web token
   - /logout (POST)\
   wylogowuje użytkownika\
   nic nie zwraca
   - /me (GET)\
   zwraca aktualnego użytkownika

## DeviceController
api/[...]
   - /{deviceId:guid} (GET)\
   zwraca urządzenie o podanym id
   - / (GET)\
   zwraca wszystkie urządzenia
   - /workspace/{workspaceId} (GET)\
   zwraca urządzenia z workspace'a
   - /{deviceId:guid} (PUT)\
   aktualizuje urządzenie\
   zwraca zaktualizowane urządzenie
   - /{deviceId:guid}/assign (POST)\
   przypisuje urządzenie do workspace'a\
   nic nie zwraca
   - /{deviceId:guid}/remove (POST)\
   usuwa urządzenie\
   nic nie zwraca
   - /{deviceId:guid}/user-access (POST)\
   daje użytkownikowi dostęp do urządzenia\
   nic nie zwraca
   - /{deviceId:guid}/user-access (DELETE)\
   zabiera użytkownikowi dostęp do urządzenia\
   nic nie zwraca
   - /{deviceId:guid}/group-access (POST)\
   daje grupie dostęp do urządzenia\
   nic nie zwraca
   - /{deviceId:guid}/group-access (DELETE)\
   zabiera grupie dostęp do urządzenia\
   nic nie zwraca
   - /my (GET)\
   zwraca dostępne urządzenia
   - /{deviceId:guid}/activate/{time:int} (POST)\
   tymczasowo aktywuje urządzenie\
   nic nie zwraca

## HealthcheckController
- api/check (GET)\
   nic nie zwraca

## UserGroupController
api/[...]
   - /{userGroupId:guid} (GET)\
   zwraca grupę użytkownika
   - /workspace/{workspaceId:guid} (GET)\
   zwraca grupy w workspace'ie
   - /workspace/{workspaceId:guid} (POST)\
   tworzy nowy workspace\
   zwraca informacje o stworzonym workspace'ie
   - /{userGroupId:guid} (PUT)\
   aktualizuje grupę\
   zwraca zaktualizowaną grupę
   - /{userGroupId:guid} (DELETE)\
   usuwa grupę\
   nic nie zwraca
   - /{userGroupId:guid}/members (POST)\
   dodaje użytkownika do grupy
   - /{userGroupId:guid}/members (DELETE)\
   usuwa użytkownika z grupy

## WorkspaceController
api/[...]
   - / (GET)\
   zwraca dostępne workspace'y
   - /{workspaceId:guid} (GET)\
   zwraca workspace
   - /join/{code} (POST)\
   dołącza do workspace'a\
   nic nie zwraca
   - / (POST)\
   tworzy workspace\
   zwraca informacje o stworzonym workspace'ie
   - /{workspaceId:guid} (DELETE)\
   usuwa workspace\
   nic nie zwraca
   - /{workspaceId:guid} (PUT)\
   aktualizuje workspace
   - /{workspaceId:guid}/members (GET)\
   zwraca członków workspace'a
   - /{workspaceId:guid}/members (POST)\
   dodaje użytkownika do workspace'a
   - /{workspaceId:guid}/members (PUT)\
   aktualizuje rolę użytkownika w workspace'ie
   - /{workspaceId:guid}/members (DELETE)\
   usuwa użytkownika z workspace'a
