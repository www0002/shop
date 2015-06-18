drop function s(json);

create or replace function s(js json) returns record as $$
declare
	field record;
	fnames text := '';
	fvalues text := '';
	query text;
	rslt record;
	rslt_count int;
begin

	for field in select * from json_each_text(js->'fields') loop
		fnames := fnames || format('%I,',field.key);
		fvalues := fvalues || format('%L,',field.value);
	end loop;
	
	select trim(trailing ',' from fnames) into fnames;
	select trim(trailing ',' from fvalues) into fvalues;
	
	query := format('update %I ',js->>'table') || ' set (' || fnames || ') = (' || fvalues || ') where code = ' || (js#>>'{fields,code}') || ' returning code, id, ''updated''';
	--query := format('update %I ',js->>'table') || ' set (' || fnames || ') = (' || fvalues || ') where code = ' || js->>'table' || ' returning *';
	
	--raise notice '%', query;
	
	execute query into rslt;
	
	GET DIAGNOSTICS rslt_count = ROW_COUNT;
	
	--raise notice '>>>> count %', rslt_count;
	
	if rslt_count > 0 then
		--raise notice 'found';
		return rslt;
	else
		--raise notice '!!!NOT FOUND!!!';
		query := format('insert into %I ',js->>'table') || ' (' || fnames || ') values (' || fvalues || ') returning code, id, ''created''';
		--raise notice '%', query;
		execute query into rslt;
		return rslt;
	end if;

end;
$$ language plpgsql;

select s('{"table":"products", "fields":{"code": 712, "name":">777>21/73 it''s a \"quotes!\" & '''' !", "volume":7, "brand":"dfdsfsdf", "description":"sfdsf\"sdfdf''sdfsdf"}}'::json);

select * from products;