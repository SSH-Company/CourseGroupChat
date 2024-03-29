CREATE SCHEMA rt;

CREATE TABLE rt."group" (
	"ID" serial NOT NULL,
	"NAME" varchar(50) NULL,
	"CREATE_DATE" date NOT NULL,
	"IS_ACTIVE" bpchar(1) NULL,
	CONSTRAINT group_pkey PRIMARY KEY ("ID")
);

CREATE TABLE rt."user" (
	"ID" serial NOT NULL,
	"FIRST_NAME" varchar(50) NOT NULL,
	"LAST_NAME" varchar(50) NOT NULL,
	"EMAIL" varchar(50) NOT NULL,
	"CREATE_DATE" date NOT NULL,
	"IS_ACTIVE" bpchar(1) NULL,
	CONSTRAINT user_pkey PRIMARY KEY ("ID")
);

CREATE TABLE rt.user_group (
	"ID" serial NOT NULL,
	"USER_ID" serial NOT NULL,
	"GROUP_ID" serial NOT NULL,
	"CREATE_DATE" date NOT NULL,
	"IS_ACTIVE" bpchar(1) NULL,
	CONSTRAINT user_group_pkey PRIMARY KEY ("ID"),
	CONSTRAINT "user_group_GROUP_ID_fkey" FOREIGN KEY ("GROUP_ID") REFERENCES rt."group"("ID"),
	CONSTRAINT "user_group_USER_ID_fkey" FOREIGN KEY ("USER_ID") REFERENCES rt."user"("ID")
);

CREATE TABLE rt.message (
	"ID" serial NOT NULL,
	"CREATOR_ID" serial NOT NULL,
	"MESSAGE_BODY" text NULL,
	"CREATE_DATE" date NOT NULL,
	CONSTRAINT message_pkey PRIMARY KEY ("ID"),
	CONSTRAINT "message_CREATOR_ID_fkey" FOREIGN KEY ("CREATOR_ID") REFERENCES rt."user"("ID")
);



CREATE TABLE rt.message_recipient (
	"ID" serial NOT NULL,
	"RECIPIENT_ID" serial NOT NULL,
	"RECIPIENT_GROUP_ID" serial NOT NULL,
	"MESSAGE_ID" serial NOT NULL,
	"IS_READ" bpchar(1) NULL,
	CONSTRAINT message_recipient_pkey PRIMARY KEY ("ID"),
	CONSTRAINT "message_recipient_MESSAGE_ID_fkey" FOREIGN KEY ("MESSAGE_ID") REFERENCES rt.message("ID"),
	CONSTRAINT "message_recipient_RECIPIENT_GROUP_ID_fkey" FOREIGN KEY ("RECIPIENT_GROUP_ID") REFERENCES rt.user_group("ID"),
	CONSTRAINT "message_recipient_RECIPIENT_ID_fkey" FOREIGN KEY ("RECIPIENT_ID") REFERENCES rt."user"("ID")
);