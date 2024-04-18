import google.generativeai as genai

with open("api_key.txt", "r") as file:
    api_key = file.read()
genai.configure(api_key=api_key)

# for model in genai.list_models(): print(model)
# model = genai.GenerativeModel("gemini-pro")
model = genai.GenerativeModel("gemini-pro-vision")

sample_file = genai.upload_file(path="test_image.jpg", display_name="sample image")
print(f"Uploaded file '{sample_file.display_name}' as: {sample_file.uri}")

# test_file = genai.get_file(name=sample_file.name)
# print(f"Retrieved file '{test_file.display_name}' as: {sample_file.uri}")

# response = model.generate_content(["What is going on in this image?", sample_file])
response = model.generate_content([sample_file])
print(response)
