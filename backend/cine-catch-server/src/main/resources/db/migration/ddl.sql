
CREATE TABLE public.movies (
                               id varchar(255) DEFAULT nextval('movies_id_seq'::regclass) NOT NULL,
                               title varchar(255) NOT NULL,
                               release_date date NULL,
                               image varchar(512) NULL,
                               director varchar(255) DEFAULT ''::character varying NULL,
                               genre varchar(20) NULL,
                               external_code varchar(50) NULL,
                               created_at timestamp DEFAULT now() NOT NULL,
                               CONSTRAINT movies_pkey PRIMARY KEY (id),
                               CONSTRAINT movies_title_key UNIQUE (title)
);


CREATE TABLE public.spatial_ref_sys (
                                        srid int4 NOT NULL,
                                        auth_name varchar(256) NULL,
                                        auth_srid int4 NULL,
                                        srtext varchar(2048) NULL,
                                        proj4text varchar(2048) NULL,
                                        CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid),
                                        CONSTRAINT spatial_ref_sys_srid_check CHECK (((srid > 0) AND (srid <= 998999)))
);


CREATE TABLE public.theaters (
                                 id varchar(50) NOT NULL,
                                 brand varchar(20) NOT NULL,
                                 "name" varchar(50) NOT NULL,
                                 address text NOT NULL,
                                 "location" public.geometry(point, 4326) NULL,
                                 CONSTRAINT theaters_pkey PRIMARY KEY (id)
);

CREATE TABLE public.users (
                              id bigserial NOT NULL,
                              email varchar(255) NOT NULL,
                              "password" varchar(255) NOT NULL,
                              nickname varchar(255) NOT NULL,
                              fcm_token varchar(255) NULL,
                              "location" public.geometry(point, 4326) NULL,
                              "role" varchar(20) NOT NULL,
                              created_at timestamp DEFAULT now() NOT NULL,
                              CONSTRAINT users_pkey PRIMARY KEY (id)
);


CREATE TABLE public.events (
                               id varchar(50) NOT NULL,
                               movie_id varchar(255) NOT NULL,
                               "type" varchar(20) DEFAULT 'GOODS'::character varying NOT NULL,
                               title varchar(255) NOT NULL,
                               start_at timestamp NOT NULL,
                               end_at timestamp NOT NULL,
                               view_count int4 DEFAULT 0 NULL,
                               created_at timestamp DEFAULT now() NULL,
                               CONSTRAINT events_pkey PRIMARY KEY (id),
                               CONSTRAINT events_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id)
);


CREATE TABLE public.theater_subscription (
                                             id varchar(255) DEFAULT nextval('theater_subscription_id_seq'::regclass) NOT NULL,
                                             user_id int8 NOT NULL,
                                             theater_id varchar(50) NOT NULL,
                                             created_at timestamp DEFAULT now() NOT NULL,
                                             CONSTRAINT theater_subscription_pkey PRIMARY KEY (id),
                                             CONSTRAINT theater_subscription_theater_id_fkey FOREIGN KEY (theater_id) REFERENCES public.theaters(id),
                                             CONSTRAINT theater_subscription_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);


CREATE TABLE public.event_location (
                                       id varchar(255) DEFAULT nextval('event_location_id_seq'::regclass) NOT NULL,
                                       theater_id varchar(50) NOT NULL,
                                       event_id varchar(50) NOT NULL,
                                       status varchar(50) NOT NULL,
                                       updated_at timestamp DEFAULT now() NOT NULL,
                                       CONSTRAINT event_location_pkey PRIMARY KEY (id),
                                       CONSTRAINT event_location_theater_id_event_id_key UNIQUE (theater_id, event_id),
                                       CONSTRAINT event_location_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
                                       CONSTRAINT event_location_theater_id_fkey FOREIGN KEY (theater_id) REFERENCES public.theaters(id)
);