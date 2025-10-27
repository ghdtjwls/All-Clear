from PIL import Image
import requests
import torch
import matplotlib.pyplot as plt
from transformers import AutoProcessor, BlipForConditionalGeneration

processor = AutoProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Load a test image (you can replace this with your own image)
url_list = [
    "https://media.gettyimages.com/id/2043715316/photo/home-security-camera-footage-of-children-coming-and-going.jpg?s=612x612&w=gi&k=20&c=9x_cvMOqduzn1sh2DdpZYZupTdDAFcs8OQ-OxDYtLqw=",
    "https://images.unsplash.com/photo-1570793005299-c091be91bbad?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2hlZWxjaGFpcnxlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGAE0_OUOd6TF2qr7dG333CH6a5hz8vBe5bQ&s"
    ]

#image = Image.open(requests.get(url, stream=True).raw)

# Load the trained model weights (replace with the path to your saved checkpoint)
checkpoint_path = "C:/Code_File/AllClear/All-Clear/vlm/vlm_checkpoints/model_epoch_5_batch_250_loss_ 0.00142.pt" # Replace with your checkpoint path
model.load_state_dict(torch.load(checkpoint_path, map_location=torch.device('cpu')))

# Set the model to evaluation mode
model.eval()

figure = plt.figure(figsize=(16, 8))
for i, img in enumerate(url_list):
    image = Image.open(requests.get(img, stream=True).raw)
    plt.subplot(1, len(url_list), i+1)

    # Prepare the image for the model
    inputs = processor(images=image, return_tensors="pt").to(device)

    # Generate a caption
    with torch.no_grad():
        outputs = model.generate(**inputs)

    # Decode and print the generated caption
    caption = processor.decode(outputs[0], skip_special_tokens=True)
    plt.imshow(image)
    plt.axis('off')
    plt.title(caption)
plt.show()