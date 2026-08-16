CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'deliverables');
CREATE POLICY "Allow public select" ON storage.objects
  FOR SELECT USING (bucket_id = 'deliverables');
CREATE POLICY "Allow public update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'deliverables');
