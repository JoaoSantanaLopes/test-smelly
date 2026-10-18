const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve retornar o usuário criado com os dados informados', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario).toMatchObject({ nome, email, idade });
    });

    test('deve gerar um id para o novo usuário', () => {
      // Arrange
      const nome = 'Fulano de Tal';

      // Act
      const usuario = userService.createUser(nome, 'fulano@teste.com', 25);

      // Assert
      expect(usuario.id).toEqual(expect.any(String));
    });

    test('deve criar o usuário com status ativo', () => {
      // Arrange
      const idade = 25;

      // Act
      const usuario = userService.createUser('Fulano', 'fulano@teste.com', idade);

      // Assert
      expect(usuario.status).toBe('ativo');
    });

    test('deve criar usuário comum quando isAdmin não é informado', () => {
      // Arrange
      const idade = 25;

      // Act
      const usuario = userService.createUser('Fulano', 'fulano@teste.com', idade);

      // Assert
      expect(usuario.isAdmin).toBe(false);
    });

    test('deve criar usuário administrador quando isAdmin é true', () => {
      // Arrange
      const isAdmin = true;

      // Act
      const usuario = userService.createUser('Admin', 'admin@teste.com', 40, isAdmin);

      // Assert
      expect(usuario.isAdmin).toBe(true);
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      // Arrange
      const idadeMenor = 17;

      // Act
      const criarMenor = () =>
        userService.createUser('Menor', 'menor@email.com', idadeMenor);

      // Assert
      expect(criarMenor).toThrow('O usuário deve ser maior de idade.');
    });

    test('deve permitir criar usuário com exatamente 18 anos', () => {
      // Arrange
      const idadeMinima = 18;

      // Act
      const usuario = userService.createUser('Jovem', 'jovem@email.com', idadeMinima);

      // Assert
      expect(usuario.idade).toBe(idadeMinima);
    });

    test.each([
      ['nome', undefined, 'sem@nome.com', 25],
      ['email', 'Sem Email', undefined, 25],
      ['idade', 'Sem Idade', 'sem@idade.com', undefined],
    ])('deve lançar erro quando o campo %s não é informado', (_campo, nome, email, idade) => {
      // Arrange (feito pelos parâmetros do test.each)

      // Act
      const criarIncompleto = () => userService.createUser(nome, email, idade);

      // Assert
      expect(criarIncompleto).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário cadastrado com o id informado', () => {
      // Arrange
      const usuarioCriado = userService.createUser('Fulano', 'fulano@teste.com', 25);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toEqual(usuarioCriado);
    });

    test('deve retornar null quando o id não existe', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve desativar um usuário comum', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('não deve desativar um usuário administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('deve retornar false ao tentar desativar um usuário inexistente', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve incluir os dados de todos os usuários cadastrados', () => {
      // Arrange
      const alice = userService.createUser('Alice', 'alice@email.com', 28);
      const bob = userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(alice.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain(bob.id);
      expect(relatorio).toContain('Bob');
    });

    test('deve refletir o status atual dos usuários', () => {
      // Arrange
      const usuario = userService.createUser('Carlos', 'carlos@email.com', 35);
      userService.deactivateUser(usuario.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('inativo');
    });

    test('deve informar que não há usuários quando nenhum foi cadastrado', () => {
      // Arrange (banco vazio garantido pelo beforeEach)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });
  });
});
