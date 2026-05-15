Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'D:\Kuliah\LIDM\assets\files\SOAL REVISI DIAGNOSTIK & UJIKOM.docx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()
$content | Out-File -FilePath 'D:\Kuliah\LIDM\assets\files\soal_raw.xml' -Encoding UTF8
Write-Host 'Done'
