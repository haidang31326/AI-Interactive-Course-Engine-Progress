package com.ai.courseengine.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class DocumentParserService {

    public String parseDocument(MultipartFile file) throws IOException {
        if(file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file rong, vui long up file khac");
        }
        String filename = file.getOriginalFilename();
        if(filename ==null) {
            throw new IllegalArgumentException("ten file khong hop le");
        }
        String lowerName = filename.toLowerCase();
        if(lowerName.endsWith(".docx")) {
            return parseDocx(file);
        }
        else if(lowerName.endsWith(".pdf")) {
            return parsePdf(file);
        }
        else if(lowerName.endsWith(".txt")) {
            return new String(file.getBytes(),java.nio.charset.StandardCharsets.UTF_8);
        }
        else {
            throw new IllegalArgumentException("he thong khong ho tro dinh dang file " + filename);
        }
    }

    private String parsePdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            return pdfStripper.getText(document);
        }
    }

    private String parseDocx(MultipartFile file) throws IOException {
        try (XWPFDocument document = new XWPFDocument(file.getInputStream());
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }
}
