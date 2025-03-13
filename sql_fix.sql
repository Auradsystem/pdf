-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS insert_file_bypass_rls(text, integer, text, uuid);
DROP FUNCTION IF EXISTS delete_file_bypass_rls(integer);

-- Recréer la fonction pour insérer un fichier en contournant RLS
CREATE OR REPLACE FUNCTION insert_file_bypass_rls(
  p_name TEXT,
  p_projet_id INTEGER,
  p_storage_path TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO files (name, projet_id, storage_path, user_id)
  VALUES (p_name, p_projet_id, p_storage_path, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer la fonction pour supprimer un fichier en contournant RLS
CREATE OR REPLACE FUNCTION delete_file_bypass_rls(
  p_file_id INTEGER
) RETURNS VOID AS $$
BEGIN
  DELETE FROM files WHERE id = p_file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
