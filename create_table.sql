*******************************************
******* create table 
*******************************************


CREATE TABLE document (
	reg_numb text,
	date_start timestamp with time zone,
	date_end timestamp with time zone,
	code text,
	name text,
    tmstmp timestamp with time zone DEFAULT now(),
	id serial unique
);


CREATE TABLE booking_specification (
	booking_id integer not null references booking(id),
	product_id integer not null,
	amt numeric not null,
	price numeric,
    tmstmp timestamp with time zone DEFAULT now(),
	id bigserial unique
);

CREATE SEQUENCE booking_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE booking_id_seq OWNED BY booking.id;
ALTER TABLE ONLY booking ALTER COLUMN id SET DEFAULT nextval('booking_id_seq'::regclass);