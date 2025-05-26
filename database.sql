create table public.users (
  id uuid not null default gen_random_uuid (),
  username character varying(50) not null,
  email character varying(100) not null,
  phone_number character varying(20) null,
  password text not null,
  avatar_url text null,
  bio text null,
  first_name character varying not null default ''::character varying,
  last_name character varying not null default ''::character varying,
  gender character varying not null default ''::character varying,
  created_at timestamp without time zone null default now(),
  is_online boolean not null default false,
  updated_at timestamp without time zone not null default now(),
  preferences json null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_key unique (id),
  constraint users_username_key unique (username),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;
create table public.stories (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  media_url text not null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  expires_at timestamp with time zone null default (
    timezone ('utc'::text, now()) + '24:00:00'::interval
  ),
  type text null,
  caption text null,
  background text null,
  constraint stories_pkey primary key (id),
  constraint stories_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint stories_type_check check (
    (
      type = any (
        array[
          'text'::text,
          'image'::text,
          'video'::text,
          'audio'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;
create table public.story_reactions (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid null default gen_random_uuid (),
  story_id uuid null default gen_random_uuid (),
  reaction text null,
  constraint story_reactions_pkey primary key (id),
  constraint story_reactions_story_id_fkey foreign KEY (story_id) references stories (id) on delete CASCADE,
  constraint story_reactions_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;
create table public.sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  token text null,
  user_agent text null,
  ip_address text null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  last_active timestamp with time zone null default now(),
  device_name text not null,
  device_type text not null,
  ended_at timestamp with time zone null,
  is_active boolean not null default true,
  is_suspicious boolean null default false,
  suspicious_reasons text null,
  browser_name text null,
  browser_version text null,
  os_name text null,
  location text null,
  constraint sessions_pkey primary key (id),
  constraint sessions_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;
create table public.notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  type character varying(50) null,
  content text null,
  is_read boolean null default false,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint notifications_pkey primary key (id),
  constraint notifications_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;
create table public.messages (
  id uuid not null default gen_random_uuid (),
  conversation_id uuid null,
  sender_id uuid null,
  content text null,
  emotion_label character varying(50) null,
  is_scam boolean null default false,
  file_url text null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint messages_pkey primary key (id),
  constraint messages_conversation_id_fkey foreign KEY (conversation_id) references conversations (id) on delete CASCADE,
  constraint messages_sender_id_fkey foreign KEY (sender_id) references users (id)
) TABLESPACE pg_default;
create table public.friendships (
  id uuid not null default gen_random_uuid (),
  user1_id uuid null,
  user2_id uuid null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint friendships_pkey primary key (id),
  constraint friendships_user1_id_user2_id_key unique (user1_id, user2_id),
  constraint friendships_user1_id_fkey foreign KEY (user1_id) references users (id) on delete CASCADE,
  constraint friendships_user2_id_fkey foreign KEY (user2_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;
create table public.friend_requests (
  id uuid not null default gen_random_uuid (),
  sender_id uuid null,
  receiver_id uuid null,
  status public.status not null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint friend_requests_pkey primary key (id),
  constraint friend_requests_receiver_id_fkey foreign KEY (receiver_id) references users (id) on delete CASCADE,
  constraint friend_requests_sender_id_fkey foreign KEY (sender_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;
create table public.emotion_logs (
  id uuid not null default gen_random_uuid (),
  message_id uuid null,
  emotion character varying(50) null,
  confidence numeric(5, 2) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint emotion_logs_pkey primary key (id),
  constraint emotion_logs_message_id_fkey foreign KEY (message_id) references messages (id) on delete CASCADE
) TABLESPACE pg_default;
create table public.files (
  id uuid not null default gen_random_uuid (),
  uploader_id uuid null,
  url text not null,
  file_type character varying(20) null,
  message_id uuid null,
  uploaded_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint files_pkey primary key (id),
  constraint files_message_id_fkey foreign KEY (message_id) references messages (id),
  constraint files_uploader_id_fkey foreign KEY (uploader_id) references users (id)
) TABLESPACE pg_default;
create table public.story_views (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  story_id uuid null,
  user_id uuid null,
  constraint story_views_pkey primary key (id),
  constraint story_views_story_id_fkey foreign KEY (story_id) references stories (id) on delete CASCADE,
  constraint story_views_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;
create table public.conversation_members (
  conversation_id uuid not null,
  user_id uuid not null,
  joined_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint conversation_members_pkey primary key (conversation_id, user_id),
  constraint conversation_members_conversation_id_fkey foreign KEY (conversation_id) references conversations (id) on delete CASCADE,
  constraint conversation_members_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;
create table public.conversations (
  id uuid not null default gen_random_uuid (),
  is_group boolean null default false,
  name character varying(100) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint conversations_pkey primary key (id)
) TABLESPACE pg_default;
create table public.message_reactions (
  id uuid not null default gen_random_uuid (),
  message_id uuid null,
  user_id uuid null,
  emoji character varying(10) not null,
  created_at timestamp without time zone null default now(),
  constraint message_reactions_pkey primary key (id),
  constraint message_reactions_message_id_user_id_emoji_key unique (message_id, user_id, emoji),
  constraint unique_user_message unique (user_id, message_id),
  constraint message_reactions_message_id_fkey foreign KEY (message_id) references messages (id) on delete CASCADE,
  constraint message_reactions_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_message_reactions_message on public.message_reactions using btree (message_id) TABLESPACE pg_default;

