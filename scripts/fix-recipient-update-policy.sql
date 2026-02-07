-- Allow recipients to update the status of wills they've received
CREATE POLICY "Recipients can update will status"
  ON wills FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);
