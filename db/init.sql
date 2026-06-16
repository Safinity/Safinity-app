-- Ativar PostGIS para operações espaciais necessárias
CREATE EXTENSION IF NOT EXISTS postgis;

-- ======================================================
-- 1. ORGANIZAÇÃO E EVENTOS
-- ======================================================

CREATE TABLE Organizations (
  id bigint PRIMARY KEY,
  name varchar(64) UNIQUE NOT NULL,
  email varchar(255),
  website varchar(255),
  created_at timestamp DEFAULT now()
);

CREATE TABLE Event (
  id bigint PRIMARY KEY,
  organization_id bigint REFERENCES Organizations(id),
  name varchar(32),
  venue_name varchar(64),
  description varchar(255),
  status varchar(32),
  category varchar(24),
  image varchar(512),
  start_date timestamp,
  end_date timestamp,
  location geography(Point, 4326), -- Alterado para PostGIS
  others jsonb
);

-- ======================================================
-- 2. UTILIZADORES E STAFF
-- ======================================================

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id varchar(255) UNIQUE,
  name varchar(50),
  username varchar(32) UNIQUE,
  password_hash varchar(255),
  role varchar(24) NOT NULL DEFAULT 'user',
  email varchar(255) UNIQUE NOT NULL,
  image text,
  location geography(Point, 4326), -- Alterado para PostGIS
  emergency_contact varchar(20)
);

CREATE TABLE Staff_Details (
  id bigint PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES users(id),
  organization_id bigint REFERENCES Organizations(id),
  role_in_org varchar(32)
);

CREATE TABLE User_locations (
  id bigint PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  location geography(Point, 4326) NOT NULL, -- Alterado para PostGIS
  timestamp timestamp NOT NULL DEFAULT now()
);

-- ======================================================
-- 3. INFRAESTRUTURA E ATIVIDADES
-- ======================================================

CREATE TABLE Points_interest (
  id bigint PRIMARY KEY,
  event_id bigint REFERENCES Event(id),
  name varchar(32)
);

CREATE TABLE Coordinates (
  id bigint PRIMARY KEY,
  point_id bigint REFERENCES Points_interest(id),
  location geography(Point, 4326) NOT NULL -- Alterado para PostGIS
);

CREATE TABLE Event_activities (
  id bigint PRIMARY KEY,
  event_id bigint NOT NULL REFERENCES Event(id),
  name varchar(100),
  start_time timestamp NOT NULL,
  end_time timestamp NOT NULL,
  description varchar(255),
  image bytea,
  speakers jsonb,
  speakers_img bytea,
  point_interest_id bigint NOT NULL REFERENCES Points_interest(id),
  specifications jsonb
);

-- ======================================================
-- 4. SEGURANÇA E ALERTAS
-- ======================================================

CREATE TABLE SOS (
  id bigint PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  location geography(Point, 4326) NOT NULL,
  description text,
  tag_selected varchar(32),
  options jsonb,
  time timestamp NOT NULL DEFAULT now()
);
CREATE INDEX sos_location_idx ON SOS USING GIST (location);

CREATE TABLE Alerts (
  id bigint PRIMARY KEY,
  sos_id bigint REFERENCES SOS(id),
  event_id bigint REFERENCES Event(id),
  staff_id bigint REFERENCES Staff_Details(id),
  title varchar(32),
  description varchar(255),
  category varchar(32),
  location geography(Point, 4326), -- Alterado para PostGIS
  time timestamp DEFAULT now(),
  status varchar(32)
);


-- ======================================================
-- 5. SOCIAL E BILHETEIRA
-- ======================================================

CREATE TABLE Friendship (
  id bigint PRIMARY KEY,
  user1_id uuid REFERENCES users(id),
  user2_id uuid REFERENCES users(id),
  state varchar(24)
);

CREATE TABLE User_Favorites (
  id bigint PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  activity_id bigint NOT NULL REFERENCES Event_activities(id)
);

CREATE TABLE Event_Tickets_Master (
  id bigint PRIMARY KEY,
  event_id bigint NOT NULL REFERENCES Event(id),
  ticket_code varchar(64) UNIQUE NOT NULL,
  is_already_linked boolean NOT NULL DEFAULT false
);

CREATE TABLE User_Tickets (
  id bigint PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  event_id bigint NOT NULL REFERENCES Event(id),
  ticket_code varchar(64) UNIQUE NOT NULL REFERENCES Event_Tickets_Master(ticket_code),
  linked_at timestamp DEFAULT now()
);

-- ======================================================
-- 6. NOTIFICAÇÕES E SENSORES
-- ======================================================

CREATE TABLE Notifications (
  id bigint PRIMARY KEY,
  event_id bigint REFERENCES Event(id),
  title varchar(32),
  description varchar(255),
  category varchar(32),
  time timestamp DEFAULT now()
);

CREATE TABLE User_Notification_Status (
  id bigint PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  notification_id bigint REFERENCES Notifications(id),
  read_at timestamp,
  CONSTRAINT unique_user_notification UNIQUE (user_id, notification_id)
);

-- Sensores: PostGIS para Heatmap
CREATE TABLE Sensor (
  id bigint PRIMARY KEY,
  event_id bigint REFERENCES Event(id),
  location geography(Point, 4326) NOT NULL,
  sensor_type varchar(32),
  last_reading_value float,
  last_reading_time timestamp
);
CREATE INDEX sensor_location_idx ON Sensor USING GIST (location);

-- ======================================================
-- Indexes Foreign Keys para joins mais rápidos
CREATE INDEX idx_event_organization_id ON Event(organization_id);
CREATE INDEX idx_staff_user_id ON Staff_Details(user_id);
CREATE INDEX idx_user_locations_user_id ON User_locations(user_id);
CREATE INDEX idx_points_event_id ON Points_interest(event_id);
CREATE INDEX idx_event_activities_event_id ON Event_activities(event_id);
CREATE INDEX idx_sos_user_id ON SOS(user_id);
CREATE INDEX idx_alerts_sos_id ON Alerts(sos_id);

--Indexes geoespaciais PostGIS
CREATE INDEX idx_event_location ON Event USING GIST(location);
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_user_locations_location ON User_locations USING GIST(location);
CREATE INDEX idx_alerts_location ON Alerts USING GIST(location);
CREATE INDEX idx_sensor_location ON Sensor USING GIST(location);

--Indexes para Join de amizades
CREATE INDEX idx_friendship_user1 ON Friendship(user1_id);
CREATE INDEX idx_friendship_user2 ON Friendship(user2_id);
-- ======================================================

-- ======================================================
-- 7. SEED DATA (Valores Iniciais)
-- ======================================================

-- Organizações
INSERT INTO Organizations (id, name, email, website) VALUES 
(1, 'Safinity Core', 'admin@safinity.com', 'https://safinity.com'),
(2, 'Tech Events Inc', 'contact@techevents.pt', 'https://techevents.pt');

INSERT INTO Event (id , organization_id, name, venue_name, status, category, start_date, end_date, location) VALUES 
(1, 1, 'Web Summit 2026', 'Altice Arena', 'active', 'Tech', '2026-11-02 09:00:00', '2026-11-05 18:00:00', ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)')),
(2, 2, 'Music Festival', 'Parque das Nações', 'planned', 'Music', '2026-07-20 14:00:00', '2026-07-22 23:00:00', ST_GeogFromText('SRID=4326;POINT(-9.092 38.765)')),
(3, 1, 'Campus Connect Live', 'Lisbon Tech Park', 'active', 'Tech', '2026-06-14 09:00:00', '2026-06-16 22:00:00', ST_GeogFromText('SRID=4326;POINT(-9.1393 38.7223)'));

-- Utilizadores
INSERT INTO users (id, clerk_id, name, username, role, email, location) VALUES 
('11111111-1111-1111-1111-111111111111', 'clerk_user_1', 'João Silva', 'jsilva', 'user', 'joao@mail.com', ST_GeogFromText('SRID=4326;POINT(-9.1397 38.7226)')),
('22222222-2222-2222-2222-222222222222', 'clerk_user_2', 'Maria Costa', 'mcosta', 'staff', 'maria@staff.pt', ST_GeogFromText('SRID=4326;POINT(-9.1389 38.7221)')),
('33333333-3333-3333-3333-333333333333', 'clerk_user_3', 'Pedro Almeida', 'pedroalmeida', 'user', 'pedro@mail.com', ST_GeogFromText('SRID=4326;POINT(-9.1391 38.7218)'));

-- Sensores
INSERT INTO Sensor (id, event_id, location, sensor_type, last_reading_value, last_reading_time) VALUES 
(1, 1, ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)'), 'crowd_counter', 85.5, now()),
(2, 1, ST_GeogFromText('SRID=4326;POINT(-9.094 38.768)'), 'crowd_counter', 42.0, now()),
(3, 1, ST_GeogFromText('SRID=4326;POINT(-9.092 38.766)'), 'noise_level', 65.2, now()),
(4, 3, ST_GeogFromText('SRID=4326;POINT(-9.1395 38.7227)'), 'crowd_counter', 64.0, now()),
(5, 3, ST_GeogFromText('SRID=4326;POINT(-9.1388 38.7219)'), 'noise_level', 48.4, now());

-- Pontos de Interesse e Atividades
INSERT INTO Points_interest (id, event_id, name) VALUES (1, 1, 'Palco Principal'), (2, 1, 'Posto Médico');

INSERT INTO Points_interest (id, event_id, name) VALUES
(3, 3, 'Main Stage'),
(4, 3, 'Food Court'),
(5, 3, 'Medical Point');

INSERT INTO Coordinates (id, point_id, location) VALUES
(1, 3, ST_GeogFromText('SRID=4326;POINT(-9.1393 38.7225)')),
(2, 4, ST_GeogFromText('SRID=4326;POINT(-9.1386 38.7222)')),
(3, 5, ST_GeogFromText('SRID=4326;POINT(-9.1398 38.7217)'));

INSERT INTO Event_activities (id, event_id, name, start_time, end_time, description, speakers, point_interest_id) VALUES 
(1, 1, 'Keynote Principal', '2026-11-02 10:00:00', '2026-11-02 11:00:00', 'Abertura do evento', NULL, 1),
(2, 1, 'Workshop IA', '2026-11-02 14:00:00', '2026-11-02 16:00:00', 'Hands-on com IA', {"speaker1": "Jane Smith"}, 1),
(3, 3, 'Opening Keynote', '2026-06-15 10:00:00', '2026-06-15 11:00:00', 'Abertura do evento atual', {"speaker1": "Ana Ribeiro"}, 3),
(4, 3, 'Lunch Networking', '2026-06-15 13:00:00', '2026-06-15 14:00:00', 'Networking no food court', {"speaker1": "Miguel Santos"}, 4);

-- SOS e Alertas
INSERT INTO SOS (id, user_id, location, description, tag_selected, time) 
VALUES (1, (SELECT id FROM users LIMIT 1), ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)'), 'Queda de utente na zona da entrada', 'Medical', now());

INSERT INTO Alerts (id, sos_id, event_id, title, description, category, location, status) 
VALUES (1, 1, 1, 'Emergência Médica', 'Assistência solicitada', 'Medical', ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)'), 'pending');
INSERT INTO Event_Tickets_Master (id, event_id, ticket_code, is_already_linked) VALUES 
(1, 1, 'TICKET-ABC-123', false),
(2, 1, 'TICKET-XYZ-789', false),
(3, 3, 'TICKET-CAMPUS-001', false),
(4, 3, 'TICKET-CAMPUS-002', false),
(5, 3, 'TICKET-CAMPUS-003', false);

INSERT INTO User_Tickets (id, user_id, event_id, ticket_code, linked_at) VALUES

(3, '8c8fcc27-685e-4b8a-8f8a-218f4a39ae1b', 3, 'TICKET-CAMPUS-003', now());

INSERT INTO User_locations (id, user_id, location, timestamp) VALUES
(1, '11111111-1111-1111-1111-111111111111', ST_GeogFromText('SRID=4326;POINT(-9.1392 38.7224)'), now() - interval '5 minutes'),
(2, '22222222-2222-2222-2222-222222222222', ST_GeogFromText('SRID=4326;POINT(-9.1387 38.7220)'), now() - interval '2 minutes'),
(3, '8c8fcc27-685e-4b8a-8f8a-218f4a39ae1b', ST_GeogFromText('SRID=4326;POINT(-9.1398 38.7218)'), now() - interval '8 minutes');


UPDATE Event_Tickets_Master SET is_already_linked = true WHERE ticket_code IN ('TICKET-CAMPUS-001', 'TICKET-CAMPUS-002', 'TICKET-CAMPUS-003');

INSERT INTO Friendship (id, user1_id, user2_id, state) 
VALUES 
(1, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted');

INSERT INTO User_Favorites (id, user_id, activity_id) 
VALUES 
(1, '11111111-1111-1111-1111-111111111111', 1),
(2, '11111111-1111-1111-1111-111111111111', 2),
(3, '11111111-1111-1111-1111-111111111111', 3);

UPDATE event
SET others = jsonb_build_object(
  'map', jsonb_build_object(
    'zoom', 17,
    'bounds', jsonb_build_object(
      'north', 38.7231,
      'south', 38.7214,
      'west', -9.1402,
      'east', -9.1378
    ),
    'currentLocation', jsonb_build_object(
      'lat', 38.7223,
      'lng', -9.1393
    ),
    'pins', jsonb_build_array(
      jsonb_build_object(
        'id', 'main-stage',
        'name', 'Main Stage',
        'type', 'stage',
        'point_interest_id', 3
      ),
      jsonb_build_object(
        'id', 'food-court',
        'name', 'Food Court',
        'type', 'food',
        'point_interest_id', 4
      ),
      jsonb_build_object(
        'id', 'medical-point',
        'name', 'Medical Point',
        'type', 'wc',
        'point_interest_id', 5
      ),
      jsonb_build_object(
        'id', 'friend-pedro',
        'name', 'Maria Costa',
        'type', 'friend',
        'friendId', '22222222-2222-2222-2222-222222222222',
        'lat', 38.7219,
        'lng', -9.1387
      )
    ),
    'stages', jsonb_build_array(
      jsonb_build_object(
        'id', 'main-stage',
        'name', 'Main Stage',
        'point_interest_id', 3,
        'rotation', 12,
        'width', 112,
        'height', 72
      ),
      jsonb_build_object(
        'id', 'side-stage',
        'name', 'Side Stage',
        'point_interest_id', 4,
        'rotation', -18,
        'width', 98,
        'height', 62
      )
    )
  )
) WHERE id = 3;

UPDATE USERS SET id = '8c8fcc27-685e-4b8a-8f8a-218f4a39ae1b' WHERE username = 'olaola';
-- Inserir os 4 novos eventos culturais
INSERT INTO Event (id, organization_id, name, venue_name, description, status, category, image, start_date, end_date, location) VALUES 
(
  4, 1, 'Arraial de Belém', 'Jardins de Belém, Lisboa', 'Os santos populares no coração de Belém', 'active', 'Cultural', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/cultural/arraial-belem.webp', 
  '2026-06-12 18:00:00', '2026-06-14 02:00:00', ST_GeogFromText('SRID=4326;POINT(-9.2023 38.6967)')
),
(
  5, 1, 'Festival dos Canais', 'Cais da Fonte Nova, Aveiro', 'Arte, música e cultura nos canais de Aveiro', 'active', 'Cultural', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/cultural/Festival-dos-Canais.jpg', 
  '2026-07-15 10:00:00', '2026-07-19 23:30:00', ST_GeogFromText('SRID=4326;POINT(-8.6432 40.6401)')
),
(
  6, 1, 'Festival do Marisco', 'Jardim do Pescador, Olhão', 'O maior festival de marisco do Algarve', 'planned', 'Cultural', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/cultural/olhao.webp', 
  '2026-08-10 19:00:00', '2026-08-15 01:00:00', ST_GeogFromText('SRID=4326;POINT(-7.8415 37.0248)')
),
(
  7, 1, 'Santos Populares do Porto', 'Fontainhas, Porto', 'A grande noite de São João e tradições nortenhas', 'active', 'Cultural', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/cultural/santos-populares.webp', 
  '2026-06-23 18:00:00', '2026-06-24 06:00:00', ST_GeogFromText('SRID=4326;POINT(-8.6019 41.1436)')
);

-- Estrutura de Mapa para: Arraial de Belém (ID 4)
UPDATE Event SET others = jsonb_build_object(
  'map', jsonb_build_object(
    'zoom', 17,
    'currentLocation', jsonb_build_object('lat', 38.6967, 'lng', -9.2023),
    'bounds', jsonb_build_object('north', 38.6975, 'south', 38.6958, 'west', -9.2035, 'east', -9.2011),
    'pins', jsonb_build_array(
      jsonb_build_object('id', 'palco-belem', 'name', 'Palco Sardinha', 'type', 'stage'),
      jsonb_build_object('id', 'manjericos', 'name', 'Bancas de Jogos', 'type', 'food')
    ),
    'stages', jsonb_build_array(
      jsonb_build_object('id', 'palco-belem', 'name', 'Palco Sardinha', 'rotation', 0, 'width', 80, 'height', 50)
    )
  )
) WHERE id = 4;

-- Estrutura de Mapa para: Festival dos Canais (ID 5)
UPDATE Event SET others = jsonb_build_object(
  'map', jsonb_build_object(
    'zoom', 16,
    'currentLocation', jsonb_build_object('lat', 40.6401, 'lng', -8.6432),
    'bounds', jsonb_build_object('north', 40.6415, 'south', 40.6385, 'west', -8.6455, 'east', -8.6410),
    'pins', jsonb_build_array(
      jsonb_build_object('id', 'palco-canais', 'name', 'Palco Fonte Nova', 'type', 'stage'),
      jsonb_build_object('id', 'artesanato', 'name', 'Mercado de Artes', 'type', 'entrance')
    ),
    'stages', jsonb_build_array(
      jsonb_build_object('id', 'palco-canais', 'name', 'Palco Fonte Nova', 'rotation', 45, 'width', 90, 'height', 60)
    )
  )
) WHERE id = 5;

-- Estrutura de Mapa para: Festival do Marisco (ID 6)
UPDATE Event SET others = jsonb_build_object(
  'map', jsonb_build_object(
    'zoom', 17,
    'currentLocation', jsonb_build_object('lat', 37.0248, 'lng', -7.8415),
    'bounds', jsonb_build_object('north', 37.0258, 'south', 37.0238, 'west', -7.8428, 'east', -7.8402),
    'pins', jsonb_build_array(
      jsonb_build_object('id', 'palco-marisco', 'name', 'Palco Principal', 'type', 'stage'),
      jsonb_build_object('id', 'zona-marisco', 'name', 'Praça da Alimentação', 'type', 'food')
    ),
    'stages', jsonb_build_array(
      jsonb_build_object('id', 'palco-marisco', 'name', 'Palco Principal', 'rotation', -10, 'width', 100, 'height', 55)
    )
  )
) WHERE id = 6;

-- Estrutura de Mapa para: Santos Populares do Porto (ID 7)
UPDATE Event SET others = jsonb_build_object(
  'map', jsonb_build_object(
    'zoom', 17,
    'currentLocation', jsonb_build_object('lat', 41.1436, 'lng', -8.6019),
    'bounds', jsonb_build_object('north', 41.1446, 'south', 41.1426, 'west', -8.6032, 'east', -8.6006),
    'pins', jsonb_build_array(
      jsonb_build_object('id', 'palco-fontainhas', 'name', 'Palco Bailarico', 'type', 'stage'),
      jsonb_build_object('id', 'barraquinhas', 'name', 'Zona dos Martelos', 'type', 'entrance')
    ),
    'stages', jsonb_build_array(
      jsonb_build_object('id', 'palco-fontainhas', 'name', 'Palco Bailarico', 'rotation', 15, 'width', 85, 'height', 50)
    )
  )
) WHERE id = 7;

-- ======================================================
-- 1. ATUALIZAÇÃO DO WEB SUMMIT EXISTENTE (ID 1)
-- ======================================================
UPDATE Event 
SET image = 'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/tech/web-summit.png'
WHERE id = 1;


-- ======================================================
-- 2. INSERÇÃO DOS NOVOS EVENTOS MUSICAIS E TECH
-- ======================================================
INSERT INTO Event (id, organization_id, name, venue_name, description, status, category, image, start_date, end_date, location) VALUES 
-- --- CATEGORIA: MUSIC ---
(
  8, 1, 'MEO Marés Vivas', 'Vila Nova de Gaia', 'O grande festival junto à foz do Douro', 'planned', 'Music', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/music/meo-mares-vivas.jpg', 
  '2026-07-17 17:00:00', '2026-07-19 02:00:00', ST_GeogFromText('SRID=4326;POINT(-8.6534 41.1347)')
),
(
  9, 1, 'MEO Sudoeste', 'Zambujeira do Mar', 'A maior semana de campismo e música eletrónica', 'planned', 'Music', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/music/meo_sudoeste.jpg', 
  '2026-08-05 16:00:00', '2026-08-09 06:00:00', ST_GeogFromText('SRID=4326;POINT(-8.7842 37.5458)')
),
(
  10, 1, 'NOS Alive', 'Passeio Marítimo de Algés', 'O melhor cartaz de indie e rock à beira-rio', 'active', 'Music', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/music/NOS-Alive.jpg', 
  '2026-07-09 15:00:00', '2026-07-12 04:00:00', ST_GeogFromText('SRID=4326;POINT(-9.2304 38.6963)')
),
(
  11, 1, 'Super Bock Super Rock', 'Herdade do Cabeço da Flauta, Meco', 'Música autêntica com o espírito icónico do Meco', 'planned', 'Music', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/music/super-bock-super-rock.jpg', 
  '2026-07-16 16:00:00', '2026-07-19 03:00:00', ST_GeogFromText('SRID=4326;POINT(-9.1384 38.5173)')
),

-- --- CATEGORIA: TECH ---
(
  12, 1, 'Future Tech Expo', 'Europarque, Santa Maria da Feira', 'Descobre o amanhã da inteligência artificial', 'active', 'Tech', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/tech/future-tech.webp', 
  '2026-09-22 09:00:00', '2026-09-24 18:00:00', ST_GeogFromText('SRID=4326;POINT(-8.5645 40.9274)')
),
(
  13, 1, 'Portugal Tech Week', 'Vários Espaços, Lisboa', 'O festival descentralizado do ecossistema tecnológico', 'planned', 'Tech', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/tech/Portugal-Tech-Week.png', 
  '2026-10-10 09:00:00', '2026-10-17 20:00:00', ST_GeogFromText('SRID=4326;POINT(-9.1393 38.7223)')
),
(
  14, 1, 'Tech Business Summit', 'FIL, Lisboa', 'Onde os negócios encontram a inovação corporativa', 'active', 'Tech', 
  'https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/tech/tech-business-summit.jpg', 
  '2026-05-28 08:30:00', '2026-05-30 19:00:00', ST_GeogFromText('SRID=4326;POINT(-9.0945 38.7725)')
);

-- MEO Marés Vivas (ID 8)
UPDATE Event SET others = jsonb_build_object('map', jsonb_build_object('zoom', 16, 'currentLocation', jsonb_build_object('lat', 41.1347, 'lng', -8.6534), 'bounds', jsonb_build_object('north', 41.1360, 'south', 41.1330, 'west', -8.6550, 'east', -8.6510), 'pins', jsonb_build_array(), 'stages', jsonb_build_array())) WHERE id = 8;

-- MEO Sudoeste (ID 9)
UPDATE Event SET others = jsonb_build_object('map', jsonb_build_object('zoom', 15, 'currentLocation', jsonb_build_object('lat', 37.5458, 'lng', -8.7842), 'bounds', jsonb_build_object('north', 37.5480, 'south', 37.5430, 'west', -8.7870, 'east', -8.7810), 'pins', jsonb_build_array(), 'stages', jsonb_build_array())) WHERE id = 9;

-- NOS Alive (ID 10)
UPDATE Event SET others = jsonb_build_object('map', jsonb_build_object('zoom', 16, 'currentLocation', jsonb_build_object('lat', 38.6963, 'lng', -9.2304), 'bounds', jsonb_build_object('north', 38.6980, 'south', 38.6950, 'west', -9.2330, 'east', -9.2280), 'pins', jsonb_build_array(jsonb_build_object('id', 'palco-nos', 'name', 'Palco NOS', 'type', 'stage')), 'stages', jsonb_build_array(jsonb_build_object('id', 'palco-nos', 'name', 'Palco NOS', 'rotation', 5, 'width', 110, 'height', 65)))) WHERE id = 10;

-- Super Bock Super Rock (ID 11)
UPDATE Event SET others = jsonb_build_object('map', jsonb_build_object('zoom', 16, 'currentLocation', jsonb_build_object('lat', 38.5173, 'lng', -9.1384), 'bounds', jsonb_build_object('north', 38.5190, 'south', 38.5150, 'west', -9.1410, 'east', -9.1350), 'pins', jsonb_build_array(), 'stages', jsonb_build_array())) WHERE id = 11;

-- Future Tech Expo (ID 12)
UPDATE Event SET others = jsonb_build_object('map', jsonb_build_object('zoom', 16, 'currentLocation', jsonb_build_object('lat', 40.9274, 'lng', -8.5645), 'bounds', jsonb_build_object('north', 40.9290, 'south', 40.9250, 'west', -8.5670, 'east', -8.5620), 'pins', jsonb_build_array(), 'stages', jsonb_build_array())) WHERE id = 12;

-- Portugal Tech Week (ID 13)
UPDATE Event SET others = jsonb_build_object('map', jsonb_build_object('zoom', 17, 'currentLocation', jsonb_build_object('lat', 38.7223, 'lng', -9.1393), 'bounds', jsonb_build_object('north', 38.7235, 'south', 38.7210, 'west', -9.1410, 'east', -9.1370), 'pins', jsonb_build_array(), 'stages', jsonb_build_array())) WHERE id = 13;

-- Tech Business Summit (ID 14)
UPDATE Event SET others = jsonb_build_object('map', jsonb_build_object('zoom', 16, 'currentLocation', jsonb_build_object('lat', 38.7725, 'lng', -9.0945), 'bounds', jsonb_build_object('north', 38.7740, 'south', 38.7710, 'west', -9.0970, 'east', -9.0920), 'pins', jsonb_build_array(), 'stages', jsonb_build_array())) WHERE id = 14;

-- ======================================================
-- 1. CRIAR OS BILHETES MESTRES (EVENT_TICKETS_MASTER)
-- ======================================================
INSERT INTO Event_Tickets_Master (id, event_id, ticket_code, is_already_linked) VALUES 
(6, 10, 'TICKET-ALIVE-999', true),      -- NOS Alive
(7, 8, 'TICKET-MARES-888', true),       -- MEO Marés Vivas
(8, 12, 'TICKET-FUTURE-777', true);     -- Future Tech Expo


-- ======================================================
-- 2. VINCULAR OS BILHETES AO TEU UTILIZADOR (USER_TICKETS)
-- ======================================================
INSERT INTO User_Tickets (id, user_id, event_id, ticket_code, linked_at) VALUES

(4, '0339bc70-bc90-4918-90ef-d11c5b6c3881', 10, 'TICKET-ALIVE-999', now()),
(5, '0339bc70-bc90-4918-90ef-d11c5b6c3881', 8, 'TICKET-MARES-888', now()),
(6, '0339bc70-bc90-4918-90ef-d11c5b6c3881', 12, 'TICKET-FUTURE-777', now());
