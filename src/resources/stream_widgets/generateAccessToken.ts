export default function generateAccessToken() {
  // generate a UUID for the access token
  return crypto.randomUUID();
}
