/*describe('Friend Flow - Login → Add Friend', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login with Clerk and add a friend', async () => {
    // ========== STEP 1: ESPERA PELA TELA DE LOGIN ==========
    console.log('🔐 Waiting for login screen...');
    await waitFor(element(by.text('Sign in')))
      .toBeVisible()
      .withTimeout(10000);

    // CLERK: Clica no botão de login
    await element(by.text('Sign in')).multiTap();

    // ========== STEP 2: FAZ LOGIN COM CLERK ==========
    // Se Clerk abre em webview, espera
    console.log('🔐 Logging in via Clerk...');
    await waitFor(element(by.text('Email address')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.type('RCTTextInput')).atIndex(0).typeText('test@example.com');
    await element(by.text('Continue')).multiTap();

    // Password
    await waitFor(element(by.type('RCTTextInput')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.type('RCTTextInput')).atIndex(0).typeText('Password123!');
    await element(by.text('Continue')).multiTap();

    // ========== STEP 3: ESPERA PELA HOME ==========
    console.log('✅ Login successful, waiting for home...');
    await waitFor(element(by.text('Home')))
      .toBeVisible()
      .withTimeout(10000);

    // ========== STEP 4: NAVEGA PARA AMIGOS ==========
    console.log('👥 Navigating to friends...');
    // Procura por "Friends" na navegação (pode ser aba, menu, etc)
    await element(by.text('Friends')).multiTap();

    await waitFor(element(by.text('Friends')))
      .toBeVisible()
      .withTimeout(5000);

    // ========== STEP 5: ADICIONA AMIGO ==========
    console.log('➕ Adding a friend...');
    // Procura pelo botão "Add" ou "+"
    await element(by.text('Add Friend')).multiTap();

    // Procura field de procura
    console.log('🔍 Searching for friend...');
    await waitFor(element(by.type('RCTTextInput')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.type('RCTTextInput')).atIndex(0).typeText('João');

    // Espera resultados aparecerem
    await waitFor(element(by.text('João')))
      .toBeVisible()
      .withTimeout(5000);

    // Clica no resultado
    console.log('✅ Clicking on friend result...');
    await element(by.text('João')).atIndex(0).multiTap();

    // Verifica que foi adicionado
    console.log('✅ Verifying friend was added...');
    await waitFor(element(by.text('João')))
      .toBeVisible()
      .withTimeout(5000);

    console.log('🎉 Test passed! Friend added successfully!');
  });
});
*/
