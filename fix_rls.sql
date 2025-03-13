-- Ajouter une colonne user_id à la table files
ALTER TABLE files ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les fichiers de leurs projets" ON files;
DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter des fichiers à leurs projets" ON files;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les fichiers de leurs projets" ON files;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les fichiers de leurs projets" ON files;

-- Créer de nouvelles politiques basées sur user_id
CREATE POLICY "Les utilisateurs peuvent voir leurs propres fichiers" 
ON files FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = (SELECT user_id FROM projets WHERE id = files.projet_id));

CREATE POLICY "Les utilisateurs peuvent ajouter leurs propres fichiers" 
ON files FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres fichiers" 
ON files FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres fichiers" 
ON files FOR DELETE 
USING (auth.uid() = user_id);
