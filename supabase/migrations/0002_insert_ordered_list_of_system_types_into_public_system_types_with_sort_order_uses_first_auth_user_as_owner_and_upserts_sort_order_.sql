-- Add sort_order column (preserve list order)
ALTER TABLE public.system_types ADD COLUMN IF NOT EXISTS sort_order integer;

-- Insert list of system types in the requested order. Uses the first auth user as owner and upserts sort_order so order is respected.
INSERT INTO public.system_types (user_id, name, sort_order)
VALUES
  ((SELECT id FROM auth.users LIMIT 1), 'Cella frigorifera (positiva o negativa)', 1),
  ((SELECT id FROM auth.users LIMIT 1), 'Chiller (gruppo frigo / refrigeratore di liquido)', 2),
  ((SELECT id FROM auth.users LIMIT 1), 'Multisplit / Multi-Split', 3),
  ((SELECT id FROM auth.users LIMIT 1), 'Pompa di calore (PDC) per ACS o ibrida', 4),
  ((SELECT id FROM auth.users LIMIT 1), 'Rooftop (Packaged Rooftop Unit – PRTU)', 5),
  ((SELECT id FROM auth.users LIMIT 1), 'Set ACS (produzione acqua calda sanitaria con pompa di calore o integrazione)', 6),
  ((SELECT id FROM auth.users LIMIT 1), 'Split / Monosplit', 7),
  ((SELECT id FROM auth.users LIMIT 1), 'UTA (Unità di Trattamento Aria)', 8),
  ((SELECT id FROM auth.users LIMIT 1), 'VRV / VRF (Variable Refrigerant Volume / Flow)', 9),
  ((SELECT id FROM auth.users LIMIT 1), 'Batterie fredde in canali o UTA', 10),
  ((SELECT id FROM auth.users LIMIT 1), 'Blast chiller / abbattitori di temperatura', 11),
  ((SELECT id FROM auth.users LIMIT 1), 'Centraline frigorifere / centrali multi-compressore', 12),
  ((SELECT id FROM auth.users LIMIT 1), 'Climatizzatore a cassetta (cassette / 4 vie, 1 via, a soffitto)', 13),
  ((SELECT id FROM auth.users LIMIT 1), 'Climatizzatore a finestra', 14),
  ((SELECT id FROM auth.users LIMIT 1), 'Climatizzatore a parete (wall-mounted)', 15),
  ((SELECT id FROM auth.users LIMIT 1), 'Climatizzatore canalizzato / ducted', 16),
  ((SELECT id FROM auth.users LIMIT 1), 'Climatizzatori evaporativi / raffrescatori adiabatici (swamp cooler)', 17),
  ((SELECT id FROM auth.users LIMIT 1), 'Condizionatore portatile / monoblocco mobile', 18),
  ((SELECT id FROM auth.users LIMIT 1), 'Console / a pavimento / a parete bassa', 19),
  ((SELECT id FROM auth.users LIMIT 1), 'Fan coil / ventilconvettori', 20),
  ((SELECT id FROM auth.users LIMIT 1), 'Free-cooling chiller / sistemi con free-cooling', 21),
  ((SELECT id FROM auth.users LIMIT 1), 'Impianti a CO₂ (transcritico, subcritico, booster)', 22),
  ((SELECT id FROM auth.users LIMIT 1), 'Impianti ad assorbimento (absorption chiller – a gas, vapore, acqua calda)', 23),
  ((SELECT id FROM auth.users LIMIT 1), 'Impianti di processo (raffreddamento stampi, olio, macchinari, etc.)', 24),
  ((SELECT id FROM auth.users LIMIT 1), 'Impianti per piste di pattinaggio su ghiaccio', 25),
  ((SELECT id FROM auth.users LIMIT 1), 'Monoblocco per celle o piccoli locali', 26),
  ((SELECT id FROM auth.users LIMIT 1), 'Motocondensanti / gruppi condensanti remoti + evaporatori', 27),
  ((SELECT id FROM auth.users LIMIT 1), 'Packaged / monoblocco canalizzato', 28),
  ((SELECT id FROM auth.users LIMIT 1), 'Piastra rapida / rapid freezers', 29),
  ((SELECT id FROM auth.users LIMIT 1), 'Pompa di calore acqua-acqua', 30),
  ((SELECT id FROM auth.users LIMIT 1), 'Pompa di calore aria-acqua', 31),
  ((SELECT id FROM auth.users LIMIT 1), 'Pompa di calore aria-aria', 32),
  ((SELECT id FROM auth.users LIMIT 1), 'Pompa di calore geotermica / ground source', 33),
  ((SELECT id FROM auth.users LIMIT 1), 'Rack refrigeranti / banchi frigo remoti (GDO/supermercati)', 34),
  ((SELECT id FROM auth.users LIMIT 1), 'Raffrescamento radiante (pavimento freddo, soffitto radiante, pareti fredde)', 35),
  ((SELECT id FROM auth.users LIMIT 1), 'Sistemi HVAC completi (Heating, Ventilation, Air Conditioning)', 36),
  ((SELECT id FROM auth.users LIMIT 1), 'Sottocielo / ceiling suspended', 37),
  ((SELECT id FROM auth.users LIMIT 1), 'Teleriscaldamento / teleraffrescamento (district cooling)', 38),
  ((SELECT id FROM auth.users LIMIT 1), 'Travi fredde / chilled beams (attivi o passivi)', 39),
  ((SELECT id FROM auth.users LIMIT 1), 'Tunnel di surgelazione / spirali IQF', 40)
ON CONFLICT ON CONSTRAINT system_types_user_name_unique
DO UPDATE SET sort_order = EXCLUDED.sort_order;