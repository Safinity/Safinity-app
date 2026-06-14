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
  image bytea,
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

-- Eventos
INSERT INTO Event (id, organization_id, name, venue_name, status, category, start_date, end_date, location) VALUES 
(1, 1, 'Web Summit 2026', 'Altice Arena', 'active', 'Tech', '2026-11-02 09:00:00', '2026-11-05 18:00:00', ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)')),
(2, 2, 'Music Festival', 'Parque das Nações', 'planned', 'Music', '2026-07-20 14:00:00', '2026-07-22 23:00:00', ST_GeogFromText('SRID=4326;POINT(-9.092 38.765)'));

-- Utilizadores
INSERT INTO users (id, clerk_id, name, username, role, email, location) VALUES 
(gen_random_uuid(), 'clerk_user_1', 'João Silva', 'jsilva', 'user', 'joao@mail.com', ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)')),
(gen_random_uuid(), 'clerk_user_2', 'Maria Costa', 'mcosta', 'staff', 'maria@staff.pt', ST_GeogFromText('SRID=4326;POINT(-9.091 38.766)'));

-- Sensores
INSERT INTO Sensor (id, event_id, location, sensor_type, last_reading_value, last_reading_time) VALUES 
(1, 1, ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)'), 'crowd_counter', 85.5, now()),
(2, 1, ST_GeogFromText('SRID=4326;POINT(-9.094 38.768)'), 'crowd_counter', 42.0, now()),
(3, 1, ST_GeogFromText('SRID=4326;POINT(-9.092 38.766)'), 'noise_level', 65.2, now());

-- Pontos de Interesse e Atividades
INSERT INTO Points_interest (id, event_id, name) VALUES (1, 1, 'Palco Principal'), (2, 1, 'Posto Médico');

INSERT INTO Event_activities (id, event_id, name, start_time, end_time, description, speaker, point_interest_id) VALUES 
(1, 1, 'Keynote Principal', '2026-11-02 10:00:00', '2026-11-02 11:00:00', 'Abertura do evento', 'John Doe', 1),
(2, 1, 'Workshop IA', '2026-11-02 14:00:00', '2026-11-02 16:00:00', 'Hands-on com IA', 1);

-- SOS e Alertas
INSERT INTO SOS (id, user_id, location, description, tag_selected, time) 
VALUES (1, (SELECT id FROM users LIMIT 1), ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)'), 'Queda de utente na zona da entrada', 'Medical', now());

INSERT INTO Alerts (id, sos_id, event_id, title, description, category, location, status) 
VALUES (1, 1, 1, 'Emergência Médica', 'Assistência solicitada', 'Medical', ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)'), 'pending');
INSERT INTO Event_Tickets_Master (id, event_id, ticket_code, is_already_linked) VALUES 
(1, 1, 'TICKET-ABC-123', false),
(2, 1, 'TICKET-XYZ-789', false);

INSERT INTO Friendship (id, user1_id, user2_id, state) 
VALUES 
(1, (SELECT id FROM users LIMIT 1), (SELECT id FROM users OFFSET 1 LIMIT 1), 'accepted');

INSERT INTO User_Favorites (id, user_id, activity_id) 
VALUES 
(1, (SELECT id FROM users LIMIT 1), 1),
(2, (SELECT id FROM users LIMIT 1), 2);