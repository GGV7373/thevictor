Place your PDF files here.

- cv.pdf              → Your main CV (referenced in qualifications.json as "cv.file")
- cert-example.pdf   → Any certification PDFs (add entries to qualifications.json "certifications" array)

To add a certification, add an entry to public/data/qualifications.json like:
{
  "title": "Certificate Name",
  "issuer": "Issuing Organisation",
  "date": "2024",
  "file": "/data/qualifications/cert-example.pdf"
}
