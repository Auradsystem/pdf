-- Création de la table des projets
CREATE TABLE projets (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Création de la table des fichiers
CREATE TABLE files (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  projet_id BIGINT REFERENCES projets(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Création d'index pour améliorer les performances
CREATE INDEX idx_projets_user_id ON projets(user_id);
CREATE INDEX idx_files_projet_id ON files(projet_id);
CREATE INDEX idx_files_user_id ON files(user_id);

-- Si les tables existent déjà et que vous voulez désactiver RLS
ALTER TABLE projets DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;

-- Suppression des politiques existantes si nécessaire
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres projets" ON projets;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres projets" ON projets;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres projets" ON projets;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres projets" ON projets;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les fichiers de leurs projets" ON files;
DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter des fichiers à leurs projets" ON files;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les fichiers de leurs projets" ON files;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les fichiers de leurs projets" ON files;
