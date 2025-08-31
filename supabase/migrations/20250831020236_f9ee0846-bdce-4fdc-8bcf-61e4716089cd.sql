-- Update OTP expiry to recommended 10 minutes for security
UPDATE auth.config 
SET 
  otp_exp = 600  -- 10 minutes in seconds
WHERE 
  parameter = 'otp_exp' OR parameter IS NULL;