drop function pgs_stock(json);
create or replace function pgs_stock(js json) returns integer as $$
declare
		field record;
		query text;
begin

		for field in select * from json_each_text(js) loop
			query := 'update product set amt = ' || format('%L',field.value) || ' where code = ' || format('%L',field.key);
			raise notice '%', query;
			execute query;
		end loop;

		return 0;
		
end;
$$ language plpgsql;

select pgs_stock('{"B-656-5259":777, "B-656-15247":888}'::json);

********************************************************************************************************************************************************************
********************************************************************************************************************************************************************
********************************************************************************************************************************************************************

select * from product where code = 'B-656-5259';




drop function s(json);
create or replace function s(js json) returns record as $$
declare
		field record;
		parnet_table_name text := '';
		parent_id int;
		fnames text := '';
		fvalues text := '';
		query text;
		rslt record;
		rslt_count int;
begin

		for field in select * from json_each_text(js->'fields') loop
		
 			parnet_table_name := (select substring(field.key from '(.*)_code$'));
			if parnet_table_name <> '' then
				fnames := fnames || parnet_table_name || '_id';
				execute 'select id from ' || format('%I',parnet_table_name) || ' where code = ' || format('%L',field.value) || ' limit 1' into parent_id;
				if parent_id is null then
					return rslt;
				end if;
				fvalues := fvalues || parent_id || ',';
			else
				fnames := fnames || format('%I,',field.key);
				fvalues := fvalues || format('%L,',field.value);
			end if;
			
			--raise notice '%', fvalues;
			
		end loop;

		select trim(trailing ',' from fnames) into fnames;
		select trim(trailing ',' from fvalues) into fvalues;

		query := format('update %I ',js->>'table') || ' set (' || fnames || ') = (' || fvalues || ') where code = ''' || (js#>>'{fields,code}') || ''' returning code, id, ''updated''';
		--query := format('update %I ',js->>'table') || ' set (' || fnames || ') = (' || fvalues || ') where code = ' || js->>'table' || ' returning *';

		raise notice '%', query;

		execute query into rslt;

		GET DIAGNOSTICS rslt_count = ROW_COUNT;

		raise notice '>>>> count %', rslt_count;

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


select s('{"table":"frame", "fields":{"code": "ub40", "name":"Удост. качества Оболонь","landscape":true,"document_code":"B-6283-1"}}'::json);