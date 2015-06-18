drop function document_create(json);

create or replace function document_create(js json) returns record as $$
declare
	field record;
	fnames text := '';
	fvalues text := '';
	query text;
	rslt record;
	rslt_count int;
	colnames text[];
	line json;
begin
 
	for field in select * from json_each_text(js) loop
		-- CONTINUE WHEN substring(field.key from 1 for 1) = '_';
		
		-- TODO: column exist!!!
		--colnames := array( select column_name from information.schema.columns where table_name=js->>'a_kind');
		
		--raise notice '%', format('%I,',field.key);
		
		--if colnames @> '{' + field.key + '}'::text[] then
		
		if EXISTS (select column_name from information_schema.columns where table_name=js->>'a_kind' and column_name=format('%I',field.key)) then
			fnames := fnames || format('%I,',field.key);
			fvalues := fvalues || format('%L,',field.value);
		end if;
		
	end loop;
	
	select trim(trailing ',' from fnames) into fnames;
	select trim(trailing ',' from fvalues) into fvalues;
	 
	query := format('insert into %I ',js->>'a_kind') || ' (' || fnames || ') values (' || fvalues || ') returning id';
	--raise notice '%', query;
	execute query into rslt;
	
	
	raise notice '%', rslt;
	
	-- TODO: t_spec (&specification) -> t_*** macro for many child document tables
	
	for line in select * from json_array_elements(js->'t_specification') loop
		
		fnames := 'booking_id,'; fvalues := rslt || ',';
		for field in select * from json_each_text(line) loop
	
			raise notice '>>%', format('%I,',field.key);
			fnames := fnames || format('%I,',field.key);
			fvalues := fvalues || format('%L,',field.value);
			
		end loop;
		
		select trim(trailing ',' from fnames) into fnames;
		select trim(trailing ',' from fvalues) into fvalues;
		query := format('insert into %I ',js->>'a_kind' || '_specification') || ' (' || fnames || ') values (' || fvalues || ') returning id, ''created''';
		--raise notice '%', query;
		execute query;

	end loop;
	
	select trim(trailing ',' from fnames) into fnames;
	select trim(trailing ',' from fvalues) into fvalues;
	
	
	return rslt;
	
end;
$$ language plpgsql;

select document_create('{"a_kind":"booking","author":"_nodjs_","t_specification":[{"product_id":1102,"amt":7,"name":"Стелла-Артуа 0,5х20","price":"65"},{"product_id":1106,"amt":4,"name":"Клинское светлое 0,5х20","price":"37"}]}'::json);

