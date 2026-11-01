package br.com.fatec.poneglyph_api.service;

import br.com.fatec.poneglyph_api.model.Cipher;
import br.com.fatec.poneglyph_api.repository.CipherRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;
@Service
public class CipherService {

    private final CipherRepository cipherRepository;

    //alfabeto base
    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789";

    public CipherService (CipherRepository cipherRepository){
        this.cipherRepository = cipherRepository;
    }
    //record (dto) basico para devolver os dados para o frontend
    public record EncryptionResult(String encryptedText, String hashKey){}

    /**
     * criptografa a mensagem e gera o poneglyph (Hash)
     */
    public EncryptionResult encrypt(String message, int step) {
        // 1 criptografa a mensagem usando o passo fornecido
        String encryptedText = processCipher(message.toLowerCase(), step);

        // 2 gera um hash único (log pose)
        String hashKey = UUID.randomUUID().toString();

        // 3 salva as informações no banco de dados com used = false
        Cipher cipher = new Cipher();
        cipher.setHashKey(hashKey);
        cipher.setStep(step);
        cipher.setUsed(false);

        cipherRepository.save(cipher);

        // 4 retorna a mensagem cifrada e o hash para o usuário
        return new EncryptionResult(encryptedText, hashKey);
    }

    /**
     * valida o hash de uso único e descriptografa a mensagem
     */
    public String decrypt(String encryptedMessage, String hashKey) {
        // 1 busca a Cifra no banco de dados pelo Hash
        Cipher cipher = cipherRepository.findByHashKey(hashKey)
                .orElseThrow(() -> new RuntimeException("Hash não encontrado! O Log Pose não existe."));

        // 2 aplica a trava de segurança (uso único)
        if (cipher.getUsed()) {
            throw new RuntimeException("Hash já utilizado! O Log Pose foi quebrado.");
        }

        // 3 descriptografa a mensagem invertendo o passo (multiplicando por -1)
        String decryptedText = processCipher(encryptedMessage.toLowerCase(), cipher.getStep() * -1);

        // 4 marca o Hash como utilizado e atualiza no banco de dados
        cipher.setUsed(true);
        cipherRepository.save(cipher);

        return decryptedText;
    }

    /**
     * logica da cifra de césar
     */
    private String processCipher(String text, int step) {
        StringBuilder result = new StringBuilder();
        int baseLength = CHARACTERS.length(); // Tamanho 36

        for (char character : text.toCharArray()) {
            int index = CHARACTERS.indexOf(character);

            // se o caractere não estiver no nosso alfabeto (como espaços ou pontuação), mantém ele igual
            if (index == -1) {
                result.append(character);
            } else {
                // calcula a nova posição.
                // A fórmula (((index + step) % tamanho) + tamanho) % tamanho resolve problemas com passos negativos
                int newIndex = (((index + step) % baseLength) + baseLength) % baseLength;
                result.append(CHARACTERS.charAt(newIndex));
            }
        }

        return result.toString();
    }

}
