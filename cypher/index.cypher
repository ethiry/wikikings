CREATE INDEX parent_index IF NOT EXISTS FOR ()-[r:PARENT_OF]->() ON (r.ROLE);
CREATE INDEX replacedby_index IF NOT EXISTS FOR ()-[r:REPLACED_BY]->() ON (r.ROLE);