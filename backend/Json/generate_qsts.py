import json

questions = [
    {"id": 1, "question": "What is the difference between Python lists and tuples?"},
    {"id": 2, "question": "Explain the concept of closures in JavaScript."},
    {"id": 3, "question": "What are the main differences between SQL and NoSQL databases?"},
    {"id": 4, "question": "How does garbage collection work in Java?"},
    {"id": 5, "question": "What is the purpose of the 'useEffect' hook in React?"}
]

# Writing the questions to a JSON file
with open("questions.json", "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=4)

print("questions.json file has been created successfully!")
