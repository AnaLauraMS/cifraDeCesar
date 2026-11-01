package br.com.fatec.poneglyph_api.controller;

import br.com.fatec.poneglyph_api.service.CipherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cipher")
public class CipherController {

    private final CipherService cipherService;

    //injeção de dependência
    public CipherController (CipherService cipherService){
        this.cipherService = cipherService;
    }

    // record para receber os dados do frontend (como se fossem DTOs)
    public record EncryptRequest (String message, int step) {}
    public record DecryptRequest (String encryptedMessage, String hashKey){}

    /**
     * Rota: POST /api/cipher/encrypt
     * Recebe a mensagem e o passo, devolve o texto cifrado e o Log Pose (Hash)
     */
    @PostMapping("/encrypt")
    public ResponseEntity<CipherService.EncryptionResult> encrypt(@RequestBody EncryptRequest request) {
        CipherService.EncryptionResult result = cipherService.encrypt(request.message(), request.step());
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/cipher/decrypt
     * recebe o texto cifrado e o hash e se for válido (e não usado), devolve o texto limpo.
     */
    @PostMapping("/decrypt")
    public ResponseEntity<String> decrypt(@RequestBody DecryptRequest request) {
        try {
            String decryptedText = cipherService.decrypt(request.encryptedMessage(), request.hashKey());
            return ResponseEntity.ok(decryptedText);
        } catch (RuntimeException e) {
            // se o Hash já foi usado ou não existe, o Service lança um erro e nós devolvemos status 400 (Bad Request)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
