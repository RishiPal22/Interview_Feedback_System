import json

questions = [
    {"id": 1, "question": "What is the difference between Python lists and tuples?"},
    {"id": 2, "question": "Explain the concept of closures in JavaScript."},
    {"id": 3, "question": "What are the main differences between SQL and NoSQL databases?"},
    {"id": 4, "question": "How does garbage collection work in Java?"},
    {"id": 5, "question": "What is the purpose of the 'useEffect' hook in React?"},
    # Easy questions
    {"id": 6, "question": "What does HTML stand for?"},
    {"id": 7, "question": "Name one use of the print() function in Python."},
    {"id": 8, "question": "What symbol is used to start a comment in Python?"},
    {"id": 9, "question": "What is the output of 2 + 2 in JavaScript?"},
    {"id": 10, "question": "Which tag is used to display images in HTML?"},
    # Technical questions
    {"id": 11, "question": "What is a REST API and why is it used?"},
    {"id": 12, "question": "Describe the difference between synchronous and asynchronous programming."},
    {"id": 13, "question": "What is a foreign key in a relational database?"},
    {"id": 14, "question": "Explain the concept of promises in JavaScript."},
    {"id": 15, "question": "What is the difference between == and === in JavaScript?"},
    {"id": 16, "question": "How do you create a virtual environment in Python?"},
    {"id": 17, "question": "What is the role of the package.json file in a Node.js project?"},
    {"id": 18, "question": "Explain the MVC architecture pattern."},
    {"id": 19, "question": "What is the use of the 'this' keyword in JavaScript?"},
    {"id": 20, "question": "How do you handle exceptions in Python?"}
]

# Writing the questions to a JSON file
with open("questions.json", "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=4)

print("questions.json file has been created successfully!")
