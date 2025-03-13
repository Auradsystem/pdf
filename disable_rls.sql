-- Désactiver RLS sur les tables
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE projets DISABLE ROW LEVEL SECURITY;

-- Suppression des politiques existantes si nécessaire
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres projets" ON projets;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres projets" ON projets;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres projets" ON projets;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres projets" ON projets;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les fichiers de leurs projets" ON files;
DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter des fichiers à leurs projets" ON files;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les fichiers de leurs projets" ON files;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les fichiers de leurs projets" ON files;

-- Vérifier que la colonne user_id existe dans la table files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE files ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;
