import os
import requests
import json

# Get Stripe secret key from environment
stripe_secret_key = os.environ.get('STRIPE_SECRET_KEY')

if not stripe_secret_key:
    print("ERROR: STRIPE_SECRET_KEY environment variable not set")
    exit(1)

# Stripe API base URL
base_url = "https://api.stripe.com/v1"
headers = {
    "Authorization": f"Bearer {stripe_secret_key}",
    "Content-Type": "application/x-www-form-urlencoded"
}

print("=== Creating Stripe Products (LIVE MODE) ===\n")

# 1. Create Plan Mensual product
print("1. Creating Plan Mensual product...")
product1_data = {
    "name": "Plan Mensual - Digicash Academy",
    "description": "Acceso mensual a los 5 campus especializados con contenido actualizado diariamente, comunidad privada, recursos descargables y soporte prioritario"
}
response1 = requests.post(f"{base_url}/products", headers=headers, data=product1_data)
product1 = response1.json()

if response1.status_code == 200:
    print(f"✓ Product created: {product1['id']}")
    
    # Create monthly price for product 1
    print("  Creating monthly price ($9.99/month)...")
    price1_data = {
        "product": product1['id'],
        "unit_amount": "999",
        "currency": "usd",
        "recurring[interval]": "month"
    }
    price1_response = requests.post(f"{base_url}/prices", headers=headers, data=price1_data)
    price1 = price1_response.json()
    
    if price1_response.status_code == 200:
        print(f"  ✓ Price created: {price1['id']}\n")
    else:
        print(f"  ✗ Error creating price: {price1}\n")
else:
    print(f"✗ Error creating product: {product1}\n")

# 2. Create Plan Completo product
print("2. Creating Plan Completo product...")
product2_data = {
    "name": "Plan Completo - Digicash Academy",
    "description": "Acceso anual completo a todos los campus, actualizaciones futuras, mentoria 1 a 1, grupo VIP exclusivo y certificados"
}
response2 = requests.post(f"{base_url}/products", headers=headers, data=product2_data)
product2 = response2.json()

if response2.status_code == 200:
    print(f"✓ Product created: {product2['id']}")
    
    # Create annual price for product 2
    print("  Creating annual price ($2,500/year)...")
    price2_data = {
        "product": product2['id'],
        "unit_amount": "250000",
        "currency": "usd",
        "recurring[interval]": "year"
    }
    price2_response = requests.post(f"{base_url}/prices", headers=headers, data=price2_data)
    price2 = price2_response.json()
    
    if price2_response.status_code == 200:
        print(f"  ✓ Price created: {price2['id']}\n")
    else:
        print(f"  ✗ Error creating price: {price2}\n")
else:
    print(f"✗ Error creating product: {product2}\n")

# Print summary
print("=== Summary ===")
if response1.status_code == 200 and price1_response.status_code == 200:
    print(f"\nPlan Mensual:")
    print(f"  Product ID: {product1['id']}")
    print(f"  Price ID: {price1['id']}")
    print(f"  Amount: $9.99/month")
    
if response2.status_code == 200 and price2_response.status_code == 200:
    print(f"\nPlan Completo:")
    print(f"  Product ID: {product2['id']}")
    print(f"  Price ID: {price2['id']}")
    print(f"  Amount: $2,500/year")

print("\n✓ All products created successfully in LIVE mode!")
print("\nNext step: Update lib/products.ts with these IDs")
