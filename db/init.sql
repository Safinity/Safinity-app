--
-- PostgreSQL database dump
--

\restrict ATIq4jLFoXzkyQLF5uK5CbpHCSOM8sfpMxhOsuzm9abtUzQjeFP3Vru4sjAsWTL

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alerts (
    id bigint NOT NULL,
    sos_id bigint,
    event_id bigint,
    staff_id bigint,
    title character varying(32),
    description character varying(255),
    category character varying(32),
    location public.geography(Point,4326),
    "time" timestamp without time zone DEFAULT now(),
    status character varying(32)
);


--
-- Name: coordinates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coordinates (
    id bigint NOT NULL,
    point_id bigint,
    location public.geography(Point,4326) NOT NULL
);


--
-- Name: event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event (
    id bigint NOT NULL,
    organization_id bigint,
    name character varying(32),
    venue_name character varying(64),
    description character varying(255),
    status character varying(32),
    category character varying(24),
    image bytea,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    location public.geography(Point,4326),
    others jsonb
);


--
-- Name: event_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_activities (
    id bigint NOT NULL,
    event_id bigint NOT NULL,
    name character varying(100),
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    description character varying(255),
    image bytea,
    speakers jsonb,
    speakers_img bytea,
    point_interest_id bigint NOT NULL,
    specifications jsonb
);


--
-- Name: event_tickets_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_tickets_master (
    id bigint NOT NULL,
    event_id bigint NOT NULL,
    ticket_code character varying(64) NOT NULL,
    is_already_linked boolean DEFAULT false NOT NULL
);


--
-- Name: friendship; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friendship (
    id bigint NOT NULL,
    user1_id uuid,
    user2_id uuid,
    state character varying(24)
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    event_id bigint,
    title character varying(32),
    description character varying(255),
    category character varying(32),
    "time" timestamp without time zone DEFAULT now()
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id bigint NOT NULL,
    name character varying(64) NOT NULL,
    email character varying(255),
    website character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: points_interest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.points_interest (
    id bigint NOT NULL,
    event_id bigint,
    name character varying(32)
);


--
-- Name: sensor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sensor (
    id bigint NOT NULL,
    event_id bigint,
    location public.geography(Point,4326) NOT NULL,
    sensor_type character varying(32),
    last_reading_value double precision,
    last_reading_time timestamp without time zone
);


--
-- Name: sos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sos (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    location public.geography(Point,4326) NOT NULL,
    description text,
    tag_selected character varying(32),
    options jsonb,
    "time" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: staff_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_details (
    id bigint NOT NULL,
    user_id uuid,
    organization_id bigint,
    role_in_org character varying(32)
);


--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorites (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    activity_id bigint NOT NULL
);


--
-- Name: user_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_locations (
    id bigint NOT NULL,
    user_id uuid,
    location public.geography(Point,4326) NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_notification_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notification_status (
    id bigint NOT NULL,
    user_id uuid,
    notification_id bigint,
    read_at timestamp without time zone
);


--
-- Name: user_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tickets (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    event_id bigint NOT NULL,
    ticket_code character varying(64) NOT NULL,
    linked_at timestamp without time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50),
    username character varying(32),
    password_hash character varying(255) NOT NULL,
    role character varying(24) NOT NULL,
    email character varying(255),
    image text,
    location public.geography(Point,4326),
    emergency_contact character varying(20),
    clerk_id character varying(50)
);


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alerts (id, sos_id, event_id, staff_id, title, description, category, location, "time", status) FROM stdin;
1	1	\N	\N	\N	\N	\N	\N	2026-06-17 09:00:11.513273	\N
2	2	\N	\N	\N	\N	\N	\N	2026-06-17 09:00:24.464184	\N
3	3	\N	\N	\N	\N	\N	\N	2026-06-17 09:02:42.212783	\N
4	4	\N	\N	\N	\N	\N	\N	2026-06-17 09:05:16.529229	\N
5	5	\N	\N	\N	\N	\N	\N	2026-06-17 09:08:03.495866	\N
6	6	\N	\N	\N	\N	\N	\N	2026-06-17 09:08:16.798961	\N
\.


--
-- Data for Name: coordinates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coordinates (id, point_id, location) FROM stdin;
1	1	0101000020E6100000649F85E9155021C07B9860BC96504440
2	2	0101000020E61000005396218E755121C029CB10C7BA504440
3	8	0101000020E6100000560E2DB29D4F21C046B6F3FDD4504440
4	9	0101000020E610000054742497FF5021C057957D5704514440
5	10	0101000020E61000005396218E755121C029CB10C7BA504440
6	11	0101000020E61000008B6CE7FBA95121C0454772F90F514440
7	12	0101000020E6100000DFC0D66A9A5021C07ED77172CE504440
8	13	0101000020E61000001D5A643BDF4F21C0D42B6519E2504440
23	5	0101000020E610000055C1A8A44E3022C06666666666624340
24	6	0101000020E6100000A913D044D83022C05F07CE1951624340
25	23	0101000020E61000006F8104C58F3122C0984C158C4A624340
26	24	0101000020E610000090A0F831E62E22C05F984C158C624340
27	25	0101000020E6100000E4839ECDAA2F22C0E0BE0E9C33624340
28	26	0101000020E6100000705F07CE193122C0D122DBF97E624340
29	27	0101000020E610000057EC2FBB272F22C0EE7C3F355E624340
30	28	0101000020E6100000E3C798BB963022C05F984C158C624340
\.


--
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event (id, organization_id, name, venue_name, description, status, category, image, start_date, end_date, location, others) FROM stdin;
3	1	Conference Lisboa 2025	MEO Arena	Evento de teste já terminado	finished	Tech	\N	2025-09-10 09:00:00	2025-09-10 18:00:00	0101000020E6100000560E2DB29D2F22C01904560E2D624340	\N
2	2	Music Festival Lisboa	Altice Arena	\N	planned	Music	\N	2026-07-20 14:00:00	2026-07-22 23:00:00	0101000020E6100000E3A59BC4203022C051DA1B7C61624340	{"map": {"zoom": 16, "bounds": {"east": -9.089500, "west": -9.098300, "north": 38.771500, "south": 38.765500}, "currentLocation": {"lat": 38.768050, "lng": -9.094050}}}
4	2	Festival Porto 2025	Ribeira	Segundo evento de teste já terminado	finished	Music	\N	2025-08-15 14:00:00	2025-08-15 23:00:00	0101000020E6100000B81E85EB513821C0508D976E12934440	{"map": {"pins": [{"id": "palco-belem", "name": "Palco Sardinha", "type": "stage"}, {"id": "manjericos", "name": "Bancas de Jogos", "type": "food"}], "zoom": 17, "bounds": {"east": -9.2011, "west": -9.2035, "north": 38.6975, "south": 38.6958}, "stages": [{"id": "palco-belem", "name": "Palco Sardinha", "width": 80, "height": 50, "rotation": 0}], "currentLocation": {"lat": 38.6967, "lng": -9.2023}}}
1	1	Web Summit 2026	Altice Arena	\N	active	Tech	https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/tech/web-summit.png	2026-06-15 14:36:07.335714	2026-06-30 14:36:07.335714	0101000020E61000008D45C9C69B5021C0B0AC2D69E1504440	\N
8	1	MEO Marés Vivas	Vila Nova de Gaia	O grande festival junto à foz do Douro	planned	Music	https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/music/meo-mares-vivas.jpg	2026-07-17 17:00:00	2026-07-19 02:00:00	0101000020E6100000AD69DE718A4E21C0B7627FD93D914440	{"map": {"pins": [], "zoom": 16, "bounds": {"east": -8.6510, "west": -8.6550, "north": 41.1360, "south": 41.1330}, "stages": [], "currentLocation": {"lat": 41.1347, "lng": -8.6534}}}
9	1	MEO Sudoeste	Zambujeira do Mar	A maior semana de campismo e música eletrónica	planned	Music	https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/music/meo_sudoeste.jpg	2026-08-05 16:00:00	2026-08-09 06:00:00	0101000020E6100000E10B93A9829121C012143FC6DCC54240	{"map": {"pins": [], "zoom": 15, "bounds": {"east": -8.7810, "west": -8.7870, "north": 37.5480, "south": 37.5430}, "stages": [], "currentLocation": {"lat": 37.5458, "lng": -8.7842}}}
10	1	NOS Alive	Passeio Marítimo de Algés	O melhor cartaz de indie e rock à beira-rio	active	Music	https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/music/NOS-Alive.jpg	2026-07-09 15:00:00	2026-07-12 04:00:00	0101000020E61000002EFF21FDF67522C0371AC05B20594340	{"map": {"pins": [{"id": "palco-nos", "name": "Palco NOS", "type": "stage"}], "zoom": 16, "bounds": {"east": -9.2280, "west": -9.2330, "north": 38.6980, "south": 38.6950}, "stages": [{"id": "palco-nos", "name": "Palco NOS", "width": 110, "height": 65, "rotation": 5}], "currentLocation": {"lat": 38.6963, "lng": -9.2304}}}
11	1	Super Bock Super Rock	Herdade do Cabeço da Flauta, Meco	Música autêntica com o espírito icónico do Meco	planned	Music	https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/music/super-bock-super-rock.jpg	2026-07-16 16:00:00	2026-07-19 03:00:00	0101000020E61000006688635DDC4622C0431CEBE236424340	{"map": {"pins": [], "zoom": 16, "bounds": {"east": -9.1350, "west": -9.1410, "north": 38.5190, "south": 38.5150}, "stages": [], "currentLocation": {"lat": 38.5173, "lng": -9.1384}}}
12	1	Future Tech Expo	Europarque, Santa Maria da Feira	Descobre o amanhã da inteligência artificial	active	Tech	https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/tech/future-tech.webp	2026-09-22 09:00:00	2026-09-24 18:00:00	0101000020E61000001B2FDD24062121C0BB270F0BB5764440	{"map": {"pins": [], "zoom": 16, "bounds": {"east": -8.5620, "west": -8.5670, "north": 40.9290, "south": 40.9250}, "stages": [], "currentLocation": {"lat": 40.9274, "lng": -8.5645}}}
13	1	Portugal Tech Week	Vários Espaços, Lisboa	O festival descentralizado do ecossistema tecnológico	planned	Tech	https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/tech/Portugal-Tech-Week.png	2026-10-10 09:00:00	2026-10-17 20:00:00	0101000020E610000065AA6054524722C04DF38E53745C4340	{"map": {"pins": [], "zoom": 17, "bounds": {"east": -9.1370, "west": -9.1410, "north": 38.7235, "south": 38.7210}, "stages": [], "currentLocation": {"lat": 38.7223, "lng": -9.1393}}}
14	1	Tech Business Summit	FIL, Lisboa	Onde os negócios encontram a inovação corporativa	active	Tech	https://fpjkgpjjdamydkpjexbx.supabase.co/storage/v1/object/public/safinity/Event/tech/tech-business-summit.jpg	2026-05-28 08:30:00	2026-05-30 19:00:00	0101000020E6100000AAF1D24D623022C07B14AE47E1624340	{"map": {"pins": [], "zoom": 16, "bounds": {"east": -9.0920, "west": -9.0970, "north": 38.7740, "south": 38.7710}, "stages": [], "currentLocation": {"lat": 38.7725, "lng": -9.0945}}}
\.


--
-- Data for Name: event_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_activities (id, event_id, name, start_time, end_time, description, image, speakers, speakers_img, point_interest_id, specifications) FROM stdin;
1	1	Keynote Principal	2026-11-02 10:00:00	2026-11-02 11:00:00	Abertura do evento	\N	\N	\N	1	\N
2	1	Workshop IA	2026-11-02 14:00:00	2026-11-02 16:00:00	Hands-on com IA	\N	\N	\N	1	\N
20	3	Mock Activity 18	2025-09-10 17:30:00	2025-09-10 17:50:00	Pagination test activity #18	\N	\N	\N	3	{}
11	3	Mock Activity 9	2025-09-10 13:00:00	2025-09-10 13:20:00	Pagination test activity #9	\N	\N	\N	3	{}
17	3	Mock Activity 15	2025-09-10 16:00:00	2025-09-10 16:20:00	Pagination test activity #15	\N	\N	\N	3	{}
12	3	Mock Activity 10	2025-09-10 13:30:00	2025-09-10 13:50:00	Pagination test activity #10	\N	\N	\N	3	{}
10	3	Mock Activity 8	2025-09-10 12:30:00	2025-09-10 12:50:00	Pagination test activity #8	\N	\N	\N	3	{}
18	3	Mock Activity 16	2025-09-10 16:30:00	2025-09-10 16:50:00	Pagination test activity #16	\N	\N	\N	3	{}
15	3	Mock Activity 13	2025-09-10 15:00:00	2025-09-10 15:20:00	Pagination test activity #13	\N	\N	\N	3	{}
13	3	Mock Activity 11	2025-09-10 14:00:00	2025-09-10 14:20:00	Pagination test activity #11	\N	\N	\N	3	{}
21	3	Mock Activity 19	2025-09-10 18:00:00	2025-09-10 18:20:00	Pagination test activity #19	\N	\N	\N	3	{}
5	3	Mock Activity 3	2025-09-10 10:00:00	2025-09-10 10:20:00	Pagination test activity #3	\N	\N	\N	3	{}
19	3	Mock Activity 17	2025-09-10 17:00:00	2025-09-10 17:20:00	Pagination test activity #17	\N	\N	\N	3	{}
8	3	Mock Activity 6	2025-09-10 11:30:00	2025-09-10 11:50:00	Pagination test activity #6	\N	\N	\N	3	{}
6	3	Mock Activity 4	2025-09-10 10:30:00	2025-09-10 10:50:00	Pagination test activity #4	\N	\N	\N	3	{}
16	3	Mock Activity 14	2025-09-10 15:30:00	2025-09-10 15:50:00	Pagination test activity #14	\N	\N	\N	3	{}
4	3	Mock Activity 2	2025-09-10 09:30:00	2025-09-10 09:50:00	Pagination test activity #2	\N	\N	\N	3	{}
22	3	Mock Activity 20	2025-09-10 18:30:00	2025-09-10 18:50:00	Pagination test activity #20	\N	\N	\N	3	{}
3	3	Mock Activity 1	2025-09-10 09:00:00	2025-09-10 09:20:00	Pagination test activity #1	\N	\N	\N	3	{}
14	3	Mock Activity 12	2025-09-10 14:30:00	2025-09-10 14:50:00	Pagination test activity #12	\N	\N	\N	3	{}
9	3	Mock Activity 7	2025-09-10 12:00:00	2025-09-10 12:20:00	Pagination test activity #7	\N	\N	\N	3	{}
7	3	Mock Activity 5	2025-09-10 11:00:00	2025-09-10 11:20:00	Pagination test activity #5	\N	\N	\N	3	{}
23	1	Startup Pitch Finals	2026-11-03 15:00:00	2026-11-03 16:30:00	Final startup pitches from selected founders.	\N	\N	\N	1	{"image": "2.jpg", "category": "Business"}
24	1	Opening Keynote: Safer Events	2026-11-02 09:30:00	2026-11-02 10:15:00	Opening session about safer crowd experiences and event technology.	\N	\N	\N	1	{"image": "1.jpg", "category": "Stages"}
25	1	Emergency Response Briefing	2026-11-04 11:00:00	2026-11-04 11:45:00	Practical guidance for safety, medical assistance and emergency response.	\N	\N	\N	2	{"image": "3.jpg", "category": "Workshops"}
26	2	Electronic Night Session	2026-07-20 22:00:00	2026-07-20 23:30:00	Late evening electronic music session.	\N	\N	\N	5	{"image": "5.jpg", "category": "Stages"}
27	2	Main Stage Opening Concert	2026-07-20 18:00:00	2026-07-20 19:30:00	Opening concert for the music festival.	\N	\N	\N	5	{"image": "4.jpg", "category": "Stages"}
28	4	Local Creators Talk	2025-08-15 16:00:00	2025-08-15 17:00:00	Conversation with Porto local creators and event partners.	\N	\N	\N	7	{"image": "9.jpg", "category": "Business"}
29	4	Porto Sunset Show	2025-08-15 18:30:00	2025-08-15 20:00:00	Sunset performance at the north stage.	\N	\N	\N	4	{"image": "8.jpg", "category": "Stages"}
30	2	Meet the Artists Podcast	2026-07-21 16:00:00	2026-07-21 17:00:00	Live podcast with festival artists and guests.	\N	\N	\N	6	{"image": "6.jpg", "category": "Podcasts"}
31	2	Festival Safety Workshop	2026-07-22 15:00:00	2026-07-22 16:00:00	Workshop about safe routes, meeting points and festival support.	\N	\N	\N	6	{"image": "7.jpg", "category": "Workshops"}
\.


--
-- Data for Name: event_tickets_master; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_tickets_master (id, event_id, ticket_code, is_already_linked) FROM stdin;
3	3	PAST-TEST-001	t
4	4	PAST-TEST-002	t
5	1	ACTIVE-804a8a6c-1	t
6	1	ACTIVE-8c8fcc27-2	t
7	1	ACTIVE-b72c7959-3	t
201	2	LISBON-b72c7959-1	t
202	2	LISBON-804a8a6c-2	t
203	2	LISBON-8c8fcc27-3	t
1	1	ABC123	f
2	1	XYZ789	f
301	8	MAR123	f
302	9	SUD123	f
305	12	FTE123	f
306	13	PTW123	f
307	14	TBS123	f
303	10	NOS123	t
304	11	SBS123	t
\.


--
-- Data for Name: friendship; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.friendship (id, user1_id, user2_id, state) FROM stdin;
1781625620302167	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	8c8fcc27-685e-4b8a-8f8a-218f4a39ae1b	PENDING
1781641922895430	b72c7959-12fc-4eb5-af57-a18ee73c37e4	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	ACCEPTED
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, event_id, title, description, category, "time") FROM stdin;
101	1	Porta principal fechada	A entrada principal foi temporariamente fechada.	security	2026-04-18 10:30:00
102	1	Saída principal fechada	A saída principal foi temporariamente fechada.	security	2026-04-18 11:08:23.327
103	1	Security Alert	Main entrance temporarily closed.	security	2026-04-20 19:18:06.551
104	1	Friend SOS alert	Tiago Santos sent an SOS request at this event.	friend_sos	2026-06-17 09:00:24.485
105	1	Friend SOS alert	Tiago Santos sent an SOS request at this event.	friend_sos	2026-06-17 09:02:42.223
106	1	Friend SOS alert	Tiago Santos sent an SOS request at this event.	friend_sos	2026-06-17 09:08:03.512
107	1	Friend SOS alert	André Dora sent an SOS request at this event.	friend_sos	2026-06-17 09:08:16.827
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, email, website, created_at) FROM stdin;
1	Safinity Core	admin@safinity.com	https://safinity.com	2026-04-14 14:57:03.177996
2	Tech Events Inc	contact@techevents.pt	https://techevents.pt	2026-04-14 14:57:03.177996
\.


--
-- Data for Name: points_interest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.points_interest (id, event_id, name) FROM stdin;
1	1	Palco Principal
2	1	Posto Médico
3	3	Mock Zone Event 3
4	4	Palco Norte
7	4	Zona Ribeira
8	1	Entrada Principal
9	1	Saída Norte
10	1	Food Court
11	1	WC
12	1	Palco Secundário
13	1	Balcão de Informação
5	2	Palco Lisboa
6	2	Food Court
23	2	Entrada Sul
24	2	Saída Norte
25	2	Posto Médico
26	2	WC
27	2	Palco Tejo
28	2	Info Point
\.


--
-- Data for Name: sensor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sensor (id, event_id, location, sensor_type, last_reading_value, last_reading_time) FROM stdin;
3	1	0101000020E6100000C976BE9F1A2F22C0355EBA490C624340	noise_level	65.2	2026-04-14 14:57:03.184292
11	1	0101000020E61000005396218E755121C029CB10C7BA504440	crowd_density	31.90132162324869	2026-06-17 10:25:47.635536
12	1	0101000020E6100000560E2DB29D4F21C046B6F3FDD4504440	crowd_density	8.55168864307025	2026-06-17 10:25:47.635536
13	1	0101000020E6100000DFC0D66A9A5021C07ED77172CE504440	crowd_density	12.898557769085672	2026-06-17 10:25:47.635536
14	1	0101000020E61000008B6CE7FBA95121C0454772F90F514440	crowd_density	93.06171174890886	2026-06-17 10:25:47.635536
10	1	0101000020E6100000649F85E9155021C07B9860BC96504440	crowd_density	86.71626844134916	2026-06-17 10:25:47.635536
1	1	0101000020E61000001D5A643BDF4F21C0D42B6519E2504440	crowd_density	23.911464045512574	2026-06-17 10:25:47.635536
2	1	0101000020E610000054742497FF5021C057957D5704514440	crowd_density	0	2026-06-17 10:25:47.635536
32	2	0101000020E61000001B9E5E29CB3022C0C364AA6054624340	crowd_density	95.5469065755388	2026-06-16 14:35:58.809413
33	2	0101000020E6100000E10B93A9823122C04A7B832F4C624340	crowd_density	100	2026-06-16 14:35:58.809413
34	2	0101000020E6100000AC8BDB68002F22C04A0C022B87624340	crowd_density	100	2026-06-16 14:35:58.809413
35	2	0101000020E610000072F90FE9B72F22C091ED7C3F35624340	crowd_density	67.33273051124335	2026-06-16 14:35:58.809413
36	2	0101000020E6100000A9A44E40133122C01FF46C567D624340	crowd_density	91.42200436171214	2026-06-16 14:35:58.809413
37	2	0101000020E6100000C976BE9F1A2F22C03C4ED1915C624340	crowd_density	54.884256533090635	2026-06-16 14:35:58.809413
38	2	0101000020E6100000545227A0893022C0AD69DE718A624340	crowd_density	87.06777317541689	2026-06-16 14:35:58.809413
39	2	0101000020E6100000ABCFD556EC2F22C0CA54C1A8A4624340	crowd_density	13.475970165398827	2026-06-16 14:35:58.809413
40	2	0101000020E61000008C4AEA04343122C003780B2428624340	crowd_density	45.231513339809794	2026-06-16 14:35:58.809413
31	2	0101000020E61000001C7C6132553022C0B537F8C264624340	crowd_density	90.83585495005262	2026-06-16 14:35:58.809413
15	1	0101000020E61000001C7C6132555021C038F8C264AA504440	crowd_density	1.2458150197406752	2026-06-17 10:25:47.635536
16	1	0101000020E61000001AC05B20415121C0E25817B7D1504440	crowd_density	20.80500812697747	2026-06-17 10:25:47.635536
17	1	0101000020E61000008D28ED0DBE5021C0FE43FAEDEB504440	crowd_density	56.02004627344809	2026-06-17 10:25:47.635536
18	1	0101000020E61000008FE4F21FD24F21C0F0164850FC504440	crowd_density	73.3007890694365	2026-06-17 10:25:47.635536
19	1	0101000020E610000036AB3E575B5121C00DE02D90A0504440	crowd_density	7.585355195161696	2026-06-17 10:25:47.635536
20	1	0101000020E610000055302AA9135021C01B2FDD2406514440	crowd_density	37.6880870358968	2026-06-17 10:25:47.635536
21	1	0101000020E6100000386744696F5021C054E3A59BC4504440	crowd_density	4.878562471487356	2026-06-17 10:25:47.635536
22	1	0101000020E610000036CD3B4ED15121C0C5FEB27BF2504440	crowd_density	42.92484425165532	2026-06-17 10:25:47.635536
\.


--
-- Data for Name: sos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sos (id, user_id, location, description, tag_selected, options, "time") FROM stdin;
1	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	\N	Seizure	{"tags": [6, 9, 5], "notes": "", "labels": ["Seizure", "Claustrophobic", "Theft"]}	2026-06-17 09:00:11.513273
2	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000EC75DE21465021C0176BE37F86504440	\N	Bleeding	{"tags": [11, 9, 10, 7, 5, 2, 6, 3], "notes": "", "labels": ["Bleeding", "Faint", "Seizure", "Claustrophobic", "Panic", "Theft", "Agression", "Allergy"]}	2026-06-17 09:00:24.464184
3	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000005E55CE1B405021C0948C571E86504440	\N	Fire	{"tags": [11, 9, 8], "notes": "", "labels": ["Fire", "Theft", "Allergy"]}	2026-06-17 09:02:42.212783
4	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	\N	Seizure	{"tags": [6, 9, 5], "notes": "", "labels": ["Seizure", "Claustrophobic", "Theft"]}	2026-06-17 09:05:16.529229
5	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000E282C1CE455021C0C7032D5285504440	\N	Fire	{"tags": [11, 9, 8, 10], "notes": "", "labels": ["Fire", "Theft", "Agression", "Allergy"]}	2026-06-17 09:08:03.495866
6	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	\N	Bleeding	{"tags": [2, 6, 9], "notes": "", "labels": ["Bleeding", "Claustrophobic", "Theft"]}	2026-06-17 09:08:16.798961
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: staff_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_details (id, user_id, organization_id, role_in_org) FROM stdin;
\.


--
-- Data for Name: user_favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_favorites (id, user_id, activity_id) FROM stdin;
3	b72c7959-12fc-4eb5-af57-a18ee73c37e4	28
\.


--
-- Data for Name: user_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_locations (id, user_id, location, "timestamp") FROM stdin;
1	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000083B60A6E355021C0171410CE7D504440	2026-06-16 10:16:27.132064
2	8c8fcc27-685e-4b8a-8f8a-218f4a39ae1b	0101000020E6100000AAF1D24D625021C054E3A59BC4504440	2026-06-16 10:16:27.132064
3	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E61000002B4ED1F7EA5121C003A83DFCD0504440	2026-06-16 10:16:27.132064
4	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:28:00.758934
5	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:32:06.685247
6	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:32:06.759506
7	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:33:30.710886
8	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:33:30.723312
9	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:33:45.991576
10	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:33:46.047698
11	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:34:23.54336
12	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:34:23.576335
13	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:34:30.479361
14	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:34:30.521473
15	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:34:48.313271
16	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:34:48.352057
17	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:36:29.261947
18	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:36:29.265044
19	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000005F53BA5F5F5021C0D9B3D65581504440	2026-06-16 14:37:33.125835
20	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000005F53BA5F5F5021C0D9B3D65581504440	2026-06-16 14:37:33.15667
21	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000005F53BA5F5F5021C0D9B3D65581504440	2026-06-16 14:37:33.537952
22	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000001AE95183615021C08B19C30D79504440	2026-06-16 14:37:45.602475
23	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000055F71F91615021C01C8850D878504440	2026-06-16 14:37:51.611414
24	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000003C7C499615021C06456D9B678504440	2026-06-16 14:38:09.642382
25	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000CA896D97615021C0E80179A478504440	2026-06-16 14:44:30.212032
26	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:58:10.335775
27	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 14:58:10.470371
28	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 15:26:31.383258
29	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 15:26:31.468312
30	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 15:49:13.31448
31	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-16 15:49:13.485944
32	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000000A42BC3E735021C0FAE5D7667D504440	2026-06-16 15:55:26.171227
33	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000000A42BC3E735021C0FAE5D7667D504440	2026-06-16 15:55:26.221318
34	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000B81ED46C785021C031D955387F504440	2026-06-16 15:55:50.432024
35	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000136BE308775021C0092115BE7E504440	2026-06-16 15:56:14.95199
36	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000136BE308775021C0092115BE7E504440	2026-06-16 15:56:14.981368
37	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000002B6F3640765021C07FCC25797E504440	2026-06-16 15:56:26.146192
38	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000682566BF755021C0EAFCE54C7E504440	2026-06-16 15:56:41.165686
39	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000085F59E36EB4C21C0FB11B62A2D504440	2026-06-16 20:13:00.310864
40	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000001F231334EB4C21C06F00792B2D504440	2026-06-16 20:13:06.200504
41	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000081AC616DE84C21C0A0DD47C32B504440	2026-06-16 20:13:17.89135
42	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000003E049F45E44C21C03D73C3A829504440	2026-06-16 20:13:23.735854
43	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000002D09C0DE24C21C0C314E68828504440	2026-06-16 20:14:40.371675
44	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000006A4E4BFE14C21C085EF826128504440	2026-06-16 20:21:20.390877
45	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000006A4E4BFE14C21C085EF826128504440	2026-06-16 20:21:20.44807
46	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000009273E2BFE14C21C0A7D0816128504440	2026-06-16 20:21:22.413458
47	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000E45A9DBFE14C21C034067F6128504440	2026-06-16 20:38:59.598631
48	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000D36E98BFE14C21C034357B6128504440	2026-06-16 20:39:11.710508
49	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000D86E98BFE14C21C034357B6128504440	2026-06-16 20:39:11.720441
50	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000F07FA4BFE14C21C0F09A766128504440	2026-06-16 20:40:12.577585
51	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000007AA0A7BFE14C21C08D32766128504440	2026-06-16 20:40:12.669741
52	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000F3649294315021C03DC2327F85504440	2026-06-17 08:55:59.052329
53	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000615C9294315021C064C2327F85504440	2026-06-17 08:55:59.126538
54	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000071082475375021C061AF462E87504440	2026-06-17 08:55:59.544562
55	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000FAB0412A365021C0BEACF87887504440	2026-06-17 08:56:26.530676
56	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000003378652A365021C06249DF7887504440	2026-06-17 08:56:26.544574
57	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-17 08:56:40.804176
58	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000088FA5BF53B5021C0B295E22088504440	2026-06-17 08:57:08.315591
59	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000586CFB3E3C5021C05A13812088504440	2026-06-17 08:57:08.318228
60	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000008544A364405021C05F3AC2D088504440	2026-06-17 08:57:08.954769
61	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000030DAB53425021C02763F12289504440	2026-06-17 08:57:38.765382
62	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E610000044ECC0D4485021C0D1FC89EA87504440	2026-06-17 08:58:00.704183
63	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000EC75DE21465021C0176BE37F86504440	2026-06-17 09:00:18.819952
64	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000002E1D85A23E5021C0609C8B0686504440	2026-06-17 09:03:33.872293
65	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-17 09:05:11.704381
66	b72c7959-12fc-4eb5-af57-a18ee73c37e4	0101000020E610000076E272BC029A5EC0DD0A613596E44240	2026-06-17 09:05:11.769082
67	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000007100EA8C3A5021C04E0AA4FE86504440	2026-06-17 09:05:21.603215
68	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000209CDE45415021C0A760C50086504440	2026-06-17 09:05:37.262651
69	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000E282C1CE455021C0C7032D5285504440	2026-06-17 09:07:52.245551
70	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000EB5ADCDB3F5021C0BC3BEED887504440	2026-06-17 09:08:51.751182
71	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000C8C2FE00405021C09D62B65E88504440	2026-06-17 09:09:05.552113
72	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000005B67B4213C5021C0E1544A8288504440	2026-06-17 09:10:47.545373
73	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E61000003BDE6B883D5021C08361AF0287504440	2026-06-17 09:18:19.590856
74	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	0101000020E6100000844D873F445021C089E3C43486504440	2026-06-17 09:24:06.681361
\.


--
-- Data for Name: user_notification_status; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_notification_status (id, user_id, notification_id, read_at) FROM stdin;
1	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	103	2026-06-16 20:21:23.163
2	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	102	2026-06-16 20:21:23.163
3	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	101	2026-06-16 20:21:23.163
4	b72c7959-12fc-4eb5-af57-a18ee73c37e4	103	2026-06-16 20:25:40.212
5	b72c7959-12fc-4eb5-af57-a18ee73c37e4	102	2026-06-16 20:25:40.212
6	b72c7959-12fc-4eb5-af57-a18ee73c37e4	101	2026-06-16 20:25:40.212
7	b72c7959-12fc-4eb5-af57-a18ee73c37e4	104	\N
8	b72c7959-12fc-4eb5-af57-a18ee73c37e4	105	\N
9	b72c7959-12fc-4eb5-af57-a18ee73c37e4	106	\N
10	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	107	2026-06-17 09:09:05.563
\.


--
-- Data for Name: user_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_tickets (id, user_id, event_id, ticket_code, linked_at) FROM stdin;
1	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	1	ACTIVE-804a8a6c-1	2026-06-16 10:03:24.762454
2	8c8fcc27-685e-4b8a-8f8a-218f4a39ae1b	1	ACTIVE-8c8fcc27-2	2026-06-16 10:03:24.762454
3	b72c7959-12fc-4eb5-af57-a18ee73c37e4	1	ACTIVE-b72c7959-3	2026-06-16 10:03:24.762454
201	b72c7959-12fc-4eb5-af57-a18ee73c37e4	2	LISBON-b72c7959-1	2026-06-16 14:17:25.782473
202	804a8a6c-5d2d-42fd-ae81-b526f0a785a7	2	LISBON-804a8a6c-2	2026-06-16 14:17:25.782473
203	8c8fcc27-685e-4b8a-8f8a-218f4a39ae1b	2	LISBON-8c8fcc27-3	2026-06-16 14:17:25.782473
1781623025114	b72c7959-12fc-4eb5-af57-a18ee73c37e4	10	NOS123	2026-06-16 15:17:05.115
1781623052680	b72c7959-12fc-4eb5-af57-a18ee73c37e4	11	SBS123	2026-06-16 15:17:32.681
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, username, password_hash, role, email, image, location, emergency_contact, clerk_id) FROM stdin;
b72c7959-12fc-4eb5-af57-a18ee73c37e4	André Dora	andredora		user	andrevasquesdora@gmail.com	\N	0101000020E610000076E272BC029A5EC0DD0A613596E44240	\N	user_3Eb3wFKjxpU2i2y5f0I1KdPv6wv
804a8a6c-5d2d-42fd-ae81-b526f0a785a7	Tiago Santos	tiagosantos		user	andrevasdor@gmail.com	\N	0101000020E6100000844D873F445021C089E3C43486504440	\N	user_3F0HGZt3w968aE0kBQoTRbDew7z
8c8fcc27-685e-4b8a-8f8a-218f4a39ae1b	ola ola	olaola		user	safinityapp@gmail.com	\N	\N	\N	user_3Dtv3K3FCJeQXyXYPRRJYAVAJzV
\.


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: coordinates coordinates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coordinates
    ADD CONSTRAINT coordinates_pkey PRIMARY KEY (id);


--
-- Name: event_activities event_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_activities
    ADD CONSTRAINT event_activities_pkey PRIMARY KEY (id);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- Name: event_tickets_master event_tickets_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_tickets_master
    ADD CONSTRAINT event_tickets_master_pkey PRIMARY KEY (id);


--
-- Name: event_tickets_master event_tickets_master_ticket_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_tickets_master
    ADD CONSTRAINT event_tickets_master_ticket_code_key UNIQUE (ticket_code);


--
-- Name: friendship friendship_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendship
    ADD CONSTRAINT friendship_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_name_key UNIQUE (name);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: points_interest points_interest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points_interest
    ADD CONSTRAINT points_interest_pkey PRIMARY KEY (id);


--
-- Name: sensor sensor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_pkey PRIMARY KEY (id);


--
-- Name: sos sos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sos
    ADD CONSTRAINT sos_pkey PRIMARY KEY (id);


--
-- Name: staff_details staff_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_details
    ADD CONSTRAINT staff_details_pkey PRIMARY KEY (id);


--
-- Name: staff_details staff_details_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_details
    ADD CONSTRAINT staff_details_user_id_key UNIQUE (user_id);


--
-- Name: user_notification_status unique_user_notification; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_status
    ADD CONSTRAINT unique_user_notification UNIQUE (user_id, notification_id);


--
-- Name: user_favorites user_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (id);


--
-- Name: user_locations user_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations
    ADD CONSTRAINT user_locations_pkey PRIMARY KEY (id);


--
-- Name: user_notification_status user_notification_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_status
    ADD CONSTRAINT user_notification_status_pkey PRIMARY KEY (id);


--
-- Name: user_tickets user_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tickets
    ADD CONSTRAINT user_tickets_pkey PRIMARY KEY (id);


--
-- Name: user_tickets user_tickets_ticket_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tickets
    ADD CONSTRAINT user_tickets_ticket_code_key UNIQUE (ticket_code);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_alerts_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_location ON public.alerts USING gist (location);


--
-- Name: idx_alerts_sos_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_sos_id ON public.alerts USING btree (sos_id);


--
-- Name: idx_event_activities_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_activities_event_id ON public.event_activities USING btree (event_id);


--
-- Name: idx_event_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_location ON public.event USING gist (location);


--
-- Name: idx_event_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_organization_id ON public.event USING btree (organization_id);


--
-- Name: idx_friendship_user1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_friendship_user1 ON public.friendship USING btree (user1_id);


--
-- Name: idx_friendship_user2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_friendship_user2 ON public.friendship USING btree (user2_id);


--
-- Name: idx_points_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_points_event_id ON public.points_interest USING btree (event_id);


--
-- Name: idx_sensor_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sensor_location ON public.sensor USING gist (location);


--
-- Name: idx_sos_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sos_user_id ON public.sos USING btree (user_id);


--
-- Name: idx_staff_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_user_id ON public.staff_details USING btree (user_id);


--
-- Name: idx_user_locations_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_locations_location ON public.user_locations USING gist (location);


--
-- Name: idx_user_locations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_locations_user_id ON public.user_locations USING btree (user_id);


--
-- Name: idx_users_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_location ON public.users USING gist (location);


--
-- Name: sensor_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sensor_location_idx ON public.sensor USING gist (location);


--
-- Name: sos_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sos_location_idx ON public.sos USING gist (location);


--
-- Name: users_clerk_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_clerk_id_key ON public.users USING btree (clerk_id);


--
-- Name: alerts alerts_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(id);


--
-- Name: alerts alerts_sos_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_sos_id_fkey FOREIGN KEY (sos_id) REFERENCES public.sos(id);


--
-- Name: alerts alerts_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff_details(id);


--
-- Name: coordinates coordinates_point_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coordinates
    ADD CONSTRAINT coordinates_point_id_fkey FOREIGN KEY (point_id) REFERENCES public.points_interest(id);


--
-- Name: event_activities event_activities_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_activities
    ADD CONSTRAINT event_activities_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(id);


--
-- Name: event_activities event_activities_point_interest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_activities
    ADD CONSTRAINT event_activities_point_interest_id_fkey FOREIGN KEY (point_interest_id) REFERENCES public.points_interest(id);


--
-- Name: event event_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: event_tickets_master event_tickets_master_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_tickets_master
    ADD CONSTRAINT event_tickets_master_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(id);


--
-- Name: friendship friendship_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendship
    ADD CONSTRAINT friendship_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id);


--
-- Name: friendship friendship_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendship
    ADD CONSTRAINT friendship_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(id);


--
-- Name: points_interest points_interest_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points_interest
    ADD CONSTRAINT points_interest_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(id);


--
-- Name: sensor sensor_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(id);


--
-- Name: sos sos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sos
    ADD CONSTRAINT sos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: staff_details staff_details_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_details
    ADD CONSTRAINT staff_details_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: staff_details staff_details_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_details
    ADD CONSTRAINT staff_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_favorites user_favorites_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.event_activities(id);


--
-- Name: user_favorites user_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_locations user_locations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations
    ADD CONSTRAINT user_locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_notification_status user_notification_status_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_status
    ADD CONSTRAINT user_notification_status_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id);


--
-- Name: user_notification_status user_notification_status_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_status
    ADD CONSTRAINT user_notification_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_tickets user_tickets_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tickets
    ADD CONSTRAINT user_tickets_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(id);


--
-- Name: user_tickets user_tickets_ticket_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tickets
    ADD CONSTRAINT user_tickets_ticket_code_fkey FOREIGN KEY (ticket_code) REFERENCES public.event_tickets_master(ticket_code);


--
-- Name: user_tickets user_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tickets
    ADD CONSTRAINT user_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ATIq4jLFoXzkyQLF5uK5CbpHCSOM8sfpMxhOsuzm9abtUzQjeFP3Vru4sjAsWTL
