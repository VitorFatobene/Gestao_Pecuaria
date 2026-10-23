ALTER TABLE animal
    ALTER COLUMN peso_kg DROP NOT NULL;

INSERT INTO pesagem_animal (animal_id, peso_kg, data_pesagem, observacao)
SELECT a.id, a.peso_kg, a.data_compra, 'Peso inicial'
FROM animal a
WHERE a.peso_kg IS NOT NULL
  AND a.peso_kg > 0
  AND NOT EXISTS (
      SELECT 1
      FROM pesagem_animal p
      WHERE p.animal_id = a.id
  );
