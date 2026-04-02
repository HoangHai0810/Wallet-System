package com.example.wallet.service;

import com.example.wallet.entity.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    private final WalletService walletService;
    private final RestTemplate restTemplate;

    @Value("${GEMINI_API_KEY:no-key-provided}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    public String analyzeSpending() {
        List<Transaction> transactions = walletService.getHistory(0, 10, null, null).getContent();

        String historyText = transactions.isEmpty()
            ? "No recent transactions found."
            : transactions.stream()
                .map(t -> String.format("- %s: $%s (Category: %s)", t.getType(), t.getAmount(), t.getCategory()))
                .collect(Collectors.joining("\n"));

        String prompt = """
            You are a professional financial advisor.
            Based on the following recent transactions of the user:
            """ + historyText + """
            
            Please provide:
            1. A brief summary of recent spending.
            2. Which category they spend the most on.
            3. One actionable tip to save money.
            
            Keep the response friendly, concise, and in English.
            """;

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        String url = GEMINI_URL + geminiApiKey;

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List candidates = (List) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    List parts = (List) content.get("parts");
                    Map firstPart = (Map) parts.get(0);
                    return (String) firstPart.get("text");
                }
            }
            return "AI analysis is not available at the moment.";
        } catch (Exception e) {
            return "Could not connect to AI service: " + e.getMessage();
        }
    }
}
