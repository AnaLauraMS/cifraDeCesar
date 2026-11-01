package br.com.fatec.poneglyph_api.repository;

import br.com.fatec.poneglyph_api.model.Cipher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CipherRepository extends JpaRepository<Cipher, Long> {
    // esse metodo busca a cifra pelo hash quando o usuário tentar descriptografar
    Optional<Cipher> findByHashKey (String hashKey);
}
