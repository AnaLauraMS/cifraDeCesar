package br.com.fatec.poneglyph_api.repository;

import br.com.fatec.poneglyph_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}