package br.com.fatec.poneglyph_api.service;

import br.com.fatec.poneglyph_api.model.Cipher;
import br.com.fatec.poneglyph_api.repository.CipherRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class CipherService {

    private final CipherRepository cipherRepository;

    // Alfabeto base alfanumérico mínimo exigido (a-z, 0-9) - Tamanho 36
    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789";

    public CipherService(CipherRepository cipherRepository) {
        this.cipherRepository = cipherRepository;
    }

    // Record (DTO) para devolver os dados para o frontend
    public record EncryptionResult(String encryptedText, String hashKey) {}

    /**
     * Criptografa a mensagem utilizando a Cifra de César com passo positivo ou negativo.
     * Gera um Hash criptográfico SHA-256 de uso único para servir como chave privada.
     * Armazena o Hash e o passo no banco de dados com used = false.
     */
    public EncryptionResult encrypt(String message, int step) {
        if (message == null || message.trim().isEmpty()) {
            throw new RuntimeException("Erro: A mensagem a ser criptografada não pode estar vazia.");
        }

        // 1. Criptografa a mensagem usando o passo fornecido (suporta passos positivos e negativos)
        String encryptedText = processCipher(message.toLowerCase(), step);

        // 2. Gera um Hash criptográfico real SHA-256 único (Chave Privada)
        String hashKey = generateSha256Hash(encryptedText, step);

        // 3. Salva no banco de dados na tabela apropriada, juntamente com o passo e used = false
        Cipher cipher = new Cipher();
        cipher.setHashKey(hashKey);
        cipher.setStep(step);
        cipher.setUsed(false);

        cipherRepository.save(cipher);

        // 4. Retorna a mensagem criptografada e o Hash (chave privada)
        return new EncryptionResult(encryptedText, hashKey);
    }

    /**
     * Valida se o hash informado existe e se não foi utilizado anteriormente.
     * Caso válido, descriptografa a mensagem, marca o hash como utilizado (used = true)
     * e retorna o texto claro (mensagem original).
     * Caso contrário, lança erro explicativo.
     */
    public String decrypt(String encryptedMessage, String hashKey) {
        if (hashKey == null || hashKey.trim().isEmpty()) {
            throw new RuntimeException("Erro: O hash correspondente deve ser informado.");
        }
        if (encryptedMessage == null || encryptedMessage.trim().isEmpty()) {
            throw new RuntimeException("Erro: A mensagem criptografada deve ser informada.");
        }

        String cleanHash = hashKey.trim();

        // 1. Valida se o hash informado existe no banco de dados
        Cipher cipher = cipherRepository.findByHashKey(cleanHash)
                .orElseThrow(() -> new RuntimeException("Erro: Hash não encontrado! A chave privada informada não existe no banco de dados."));

        // 2. Valida se o hash já foi utilizado anteriormente (Trava de Uso Único)
        if (Boolean.TRUE.equals(cipher.getUsed())) {
            throw new RuntimeException("Erro: Este hash já foi utilizado anteriormente! A chave privada só pode ser usada uma única vez.");
        }

        // 3. Descriptografa a mensagem invertendo o passo (multiplicando por -1)
        String decryptedText = processCipher(encryptedMessage.toLowerCase().trim(), cipher.getStep() * -1);

        // 4. Marca o Hash como utilizado e atualiza no banco de dados
        cipher.setUsed(true);
        cipherRepository.save(cipher);

        return decryptedText;
    }

    /**
     * Lógica da Cifra de César com alfabeto alfanumérico (a-z, 0-9).
     * Suporta deslocamentos positivos e negativos (modulação cíclica dupla).
     */
    private String processCipher(String text, int step) {
        StringBuilder result = new StringBuilder();
        int baseLength = CHARACTERS.length(); // 36 caracteres

        for (char character : text.toCharArray()) {
            int index = CHARACTERS.indexOf(character);

            // Caracteres fora do alfabeto (espaços, pontuação) são preservados
            if (index == -1) {
                result.append(character);
            } else {
                // Fórmula cíclica que resolve deslocamentos positivos e negativos
                int newIndex = (((index + step) % baseLength) + baseLength) % baseLength;
                result.append(CHARACTERS.charAt(newIndex));
            }
        }

        return result.toString();
    }

    /**
     * Gera um Hash criptográfico autêntico SHA-256 de 64 caracteres hexadecimais
     */
    private String generateSha256Hash(String text, int step) {
        try {
            String rawInput = text + ":" + step + ":" + UUID.randomUUID().toString() + ":" + System.nanoTime();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(rawInput.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        }
    }
}
