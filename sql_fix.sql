-- Créer une fonction RPC qui contourne complètement RLS
CREATE OR REPLACE FUNCTION insert_file_bypass_rls(
  p_name TEXT,
  p_projet_id BIGINT,
  p_storage_path TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS VOID
SECURITY DEFINER -- Cette ligne est cruciale - elle fait exécuter la fonction avec les privilèges du créateur
AS $$
BEGIN
  INSERT INTO files (name, projet_id, storage_path, user_id)
  VALUES (p_name, p_projet_id, p_storage_path, p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Créer une fonction RPC pour supprimer un fichier en contournant RLS
CREATE OR REPLACE FUNCTION delete_file_bypass_rls(
  p_file_id BIGINT
) RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM files WHERE id = p_file_id;
END;
$$ LANGUAGE plpgsql;

-- Désactiver complètement RLS sur la table files
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
