import os
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans
from skimage import color
import json

class ColorProcessor:
    def __init__(self, textures_path, exclude_keywords=None):
        self.textures_path = textures_path
        # Comprehensive exclusion list for non-solid building blocks
        self.exclude_keywords = exclude_keywords or [
            "ore", "leaves", "command", "structure", "barrier", "debug",
            "sapling", "flower", "candle", "pane", "fire", "torch", "lamp",
            "rail", "redstone", "comparator", "repeater", "dust", "wire",
            "crop", "plant", "stem", "roots", "vines", "fan", "coral_fan",
            "lily", "tulip", "orchid", "allium", "cornflower", "poppy", "daisy",
            "peony", "rose", "sunflower", "lilac", "dandelion", "azure_bluet",
            "oxeye_daisy", "fern", "bush", "grass", "mushroom", "fungus",
            "pot", "sniffer_egg", "egg", "turtle_egg", "froglight", "shulker_box",
            "glass", "translucent", "overlay", "destroy_stage", "door", "trapdoor",
            "button", "pressure_plate", "lever", "daylight_detector", "observer",
            "piston", "dispenser", "dropper", "hopper", "crafter", "furnace", "smoker",
            "blast_furnace", "lectern", "brewing_stand", "cauldron", "composter",
            "barrel", "chest", "ender_chest", "shulker", "bed", "anvil", "enchanting_table",
            "crafting_table", "smithing_table", "cartography_table", "fletching_table",
            "grindstone", "stonecutter", "loom", "jukebox", "note_block", "bell",
            "campfire", "lantern", "conduit", "beacon", "dragon_egg", "cake", "scaffold",
            "pointed_dripstone", "amethyst_cluster", "amethyst_bud", "budding_amethyst",
            "small_dripleaf", "big_dripleaf", "spore_blossom", "azalea", "mangrove_propagule",
            "hanging_roots", "sculk_shrieker", "sculk_sensor", "sculk_catalyst", "sculk_vein",
            "trial_spawner", "vault", "heavy_core", "stage", "wheat", "beetroots", "potatoes", "carrots",
            "farmland", "path"
        ]
        self.block_data = []

    def is_excluded(self, filename):
        return any(keyword in filename.lower() for keyword in self.exclude_keywords)

    def extract_dominant_color(self, image_path):
        with Image.open(image_path) as img:
            img = img.convert("RGBA")
            pixels = np.array(img)
            
            # Flatten pixels and filter out transparent/semi-transparent ones
            # pixels shape is (H, W, 4)
            flat_pixels = pixels.reshape(-1, 4)
            # Filter for alpha > 200 (mostly opaque)
            opaque_pixels = flat_pixels[flat_pixels[:, 3] > 200][:, :3]

            if len(opaque_pixels) == 0:
                return None

            # Use K-Means to find the dominant color
            # We use n_clusters=3 to find a few clusters and then pick the most "vibrant" or dominant
            kmeans = KMeans(n_clusters=3, n_init=10)
            kmeans.fit(opaque_pixels)
            
            # Count pixels in each cluster
            labels = kmeans.labels_
            counts = np.bincount(labels)
            
            # For now, just take the most frequent cluster center
            dominant_rgb = kmeans.cluster_centers_[np.argmax(counts)]
            return dominant_rgb.astype(int).tolist()

    def process_all_textures(self):
        self.block_data = []
        if not os.path.exists(self.textures_path):
            print(f"Path not found: {self.textures_path}")
            return []

        for filename in os.listdir(self.textures_path):
            if filename.endswith(".png") and not self.is_excluded(filename):
                file_path = os.path.join(self.textures_path, filename)
                try:
                    rgb = self.extract_dominant_color(file_path)
                    if rgb:
                        # Convert RGB to CIELAB
                        # color.rgb2lab expects normalized [0, 1] RGB
                        rgb_normalized = np.array(rgb) / 255.0
                        lab = color.rgb2lab(rgb_normalized.reshape(1, 1, 3)).reshape(3).tolist()
                        
                        self.block_data.append({
                            "id": filename,
                            "name": filename.replace(".png", "").replace("_", " ").title(),
                            "rgb": rgb,
                            "lab": lab,
                            "hex": '#{:02x}{:02x}{:02x}'.format(*rgb)
                        })
                except Exception as e:
                    print(f"Error processing {filename}: {e}")
        
        return self.block_data

if __name__ == "__main__":
    # Test block for local execution
    processor = ColorProcessor("textures")
    data = processor.process_all_textures()
    print(f"Processed {len(data)} blocks.")
    if data:
        print(f"Sample: {data[0]}")
