import base64
import zlib
import urllib.request

mermaid_text = """erDiagram
    USERS ||--o{ VISITORS : "guard creates"
    USERS ||--o{ COMPLAINTS : "member submits"
    USERS ||--o{ BILLS : "member pays"
    USERS {
        string id PK
        string role "member, guard, admin"
        string name
        string password
        string phone "conditional"
        string flatNumber "conditional"
        string wing "conditional"
        string timestamp
    }
    VISITORS {
        string id PK
        string guardId FK "Ref: users.id"
        string visitorName
        string phone
        string reason
        string status "pending, approved, rejected"
        string flatNumber
        string wing
        string timestamp
    }
    COMPLAINTS {
        string id PK
        string memberId FK "Ref: users.id"
        string flatNumber
        string text
        string status "open, resolved"
        string timestamp
    }
    BILLS {
        string id PK
        string targetId FK "Ref: users.id"
        string wing
        string flatNumber
        float amount
        string description
        string dueDate
        string status "pending, paid"
        string timestamp
    }"""

compressed = zlib.compress(mermaid_text.encode('utf-8'), 9)
b64 = base64.urlsafe_b64encode(compressed).decode('ascii')

url = f"https://kroki.io/mermaid/pdf/{b64}"

try:
    print(f"Downloading from Kroki API...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        with open('ER_Diagram.pdf', 'wb') as f:
            f.write(response.read())
    print("Successfully downloaded ER_Diagram.pdf")
except Exception as e:
    print(f"Failed to download: {e}")
