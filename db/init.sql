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
  latitude numeric(9,6),
  longitude numeric(9,6),
  others jsonb
);

-- ======================================================
-- 2. UTILIZADORES E STAFF
-- ======================================================

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50),
  username varchar(32) UNIQUE,
  password_hash varchar(255) NOT NULL,
  role varchar(24) NOT NULL,
  email varchar(255) UNIQUE,
  image bytea,
  latitude numeric(9,6),
  longitude numeric(9,6),
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
  latitude numeric(9,6) NOT NULL,
  longitude numeric(9,6) NOT NULL,
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
  latitude numeric(9,6) NOT NULL,
  longitude numeric(9,6) NOT NULL,
  position int
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

-- SOS usa geography para calcular proximidade de ajuda
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
  latitude numeric(9,6),
  longitude numeric(9,6),
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
-- 7. SEED DATA (Valores Iniciais)
-- ======================================================

-- Organizações
INSERT INTO Organizations (id, name, email, website) VALUES 
(1, 'Safinity Core', 'admin@safinity.com', 'https://safinity.com'),
(2, 'Tech Events Inc', 'contact@techevents.pt', 'https://techevents.pt');

-- Eventos
INSERT INTO Event (id, organization_id, name, venue_name, status, category, start_date, end_date, latitude, longitude) VALUES 
(1, 1, 'Web Summit 2026', 'Altice Arena', 'active', 'Tech', '2026-11-02 09:00:00', '2026-11-05 18:00:00', 38.767, -9.093),
(2, 2, 'Music Festival', 'Parque das Nações', 'planned', 'Music', '2026-07-20 14:00:00', '2026-07-22 23:00:00', 38.765, -9.092);

-- Utilizadores
INSERT INTO users (id, name, username, password_hash, role, email, latitude, longitude) VALUES 
(gen_random_uuid(), 'João Silva', 'jsilva', '$2b$12$HqISlK5K7y5J8v9W4z6X6u4Xuwu', 'user', 'joao@mail.com', 38.767, -9.093),
(gen_random_uuid(), 'Maria Costa', 'mcosta', '$2b$12$HqISlK5K7y5J8v9W4z6X6u4X4Hello', 'staff', 'maria@staff.pt', 38.766, -9.091);

-- Sensores (Exemplo de densidade para Heatmap - PostGIS)
-- Nota: A localização é definida por ST_GeogFromText
INSERT INTO Sensor (id, event_id, location, sensor_type, last_reading_value, last_reading_time) VALUES 
(1, 1, ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)'), 'crowd_counter', 85.5, now()),
(2, 1, ST_GeogFromText('SRID=4326;POINT(-9.094 38.768)'), 'crowd_counter', 42.0, now()),
(3, 1, ST_GeogFromText('SRID=4326;POINT(-9.092 38.766)'), 'noise_level', 65.2, now());

-- Pontos de Interesse e Atividades
INSERT INTO Points_interest (id, event_id, name) VALUES (1, 1, 'Palco Principal'), (2, 1, 'Posto Médico');

INSERT INTO Event_activities (id, event_id, name, start_time, end_time, description, point_interest_id) VALUES 
(1, 1, 'Keynote Principal', '2026-11-02 10:00:00', '2026-11-02 11:00:00', 'Abertura do evento', 1),
(2, 1, 'Workshop IA', '2026-11-02 14:00:00', '2026-11-02 16:00:00', 'Hands-on com IA', 1);

-- Bilhetes (Master + Link)
INSERT INTO Event_Tickets_Master (id, event_id, ticket_code, is_already_linked) VALUES 
(1, 1, 'TICKET-ABC-123', false),
(2, 1, 'TICKET-XYZ-789', false);

INSERT INTO Friendship (id, user1_id, user2_id, state) 
VALUES 
(1, (SELECT id FROM users LIMIT 1), (SELECT id FROM users OFFSET 1 LIMIT 1), 'accepted');

-- Simulação de SOS (Testando PostGIS para detetar zonas de perigo)
INSERT INTO SOS (id, user_id, location, description, tag_selected, time) 
VALUES 
(1, (SELECT id FROM users LIMIT 1), ST_GeogFromText('SRID=4326;POINT(-9.093 38.767)'), 'Queda de utente na zona da entrada', 'Medical', now());

-- Simulação de Alerta ligado ao SOS
INSERT INTO Alerts (id, sos_id, event_id, title, description, category, latitude, longitude, status) 
VALUES 
(1, 1, 1, 'Emergência Médica', 'Assistência solicitada no Palco Principal', 'Medical', 38.767, -9.093, 'pending');