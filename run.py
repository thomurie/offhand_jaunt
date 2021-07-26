from app import app
 
if __name__ == "__main__":
  app.run(ssl_context=("keys/example.com+5.pem", "keys/example.com+5-key.pem"))