"""Bundle the editable film and its finished deliverables, without dependencies."""
import hashlib
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent
target = root / 'output/hygene-ops-editable.zip'
source_files = sorted(path for path in root.iterdir() if path.is_file())
asset_files = sorted(path for path in (root/'assets').iterdir() if path.is_file() and path.name != 'voice-test.mp3')
outputs = [root/'output'/name for name in ('hygene-ops-investor.mp4','captions.srt','audio-report.json','validation.txt','poster.png')]
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for path in source_files + asset_files + outputs:
        archive.write(path, 'hygene-ops-investor-film/' + str(path.relative_to(root)))
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    assert 'hygene-ops-investor-film/assets/soundtrack.wav' in archive.namelist()
    assert 'hygene-ops-investor-film/output/hygene-ops-investor.mp4' in archive.namelist()
for path in [root/'output/hygene-ops-investor.mp4', target]:
    checksum=hashlib.sha256(path.read_bytes()).hexdigest()
    print(f'{path.name}: {path.stat().st_size:,} bytes · SHA-256 {checksum}')
