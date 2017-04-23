import shutil
import json

# Convert textures
data = json.load(open('design/merged/textures.json'))
converted = {}
converted['image'] = data['meta']['image']
converted['frames'] = []
for item in data['frames']:
    converted['frames'].append({
        'id': item['filename'].replace('.png', ''),
        'rect': {
            'x': item['frame']['x'],
            'y': item['frame']['y'],
            'width': item['frame']['w'],
            'height': item['frame']['h']
        },
        'rotated': item['rotated'],
        'anchor': {
            'x': item['pivot']['x'],
            'y': item['pivot']['y']
        }
    })

result = json.dumps(converted, sort_keys=True, indent=2, separators=(',', ': '))
f = open('source/assets/textures/textures.json', 'w')
f.write(result)
f.close()

shutil.copy('design/merged/textures.png', 'source/assets/textures/textures.png')