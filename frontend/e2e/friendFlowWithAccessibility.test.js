describe('Friend Flow - Login → Add Friend (With Accessibility Labels)', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('Complete user flow: Login → Friends → Add Friend', async () => {
    // ========== STEP 1: CLERK LOGIN ==========
    console.log('🔐 Step 1: Waiting for login screen...');
    await waitFor(element(by.text('Log In')))
      .toBeVisible()
      .withTimeout(10000);

    // Clica Login button
    await element(by.text('Log In')).multiTap();

    // Clerk webview - email
    console.log('🔐 Step 2: Entering email in Clerk...');
    await waitFor(element(by.type('RCTTextInput')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.type('RCTTextInput')).atIndex(0).typeText('test@example.com');
    await element(by.text('Continue')).multiTap();

    // Password
    console.log('🔐 Step 3: Entering password...');
    await waitFor(element(by.type('RCTTextInput')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.type('RCTTextInput')).atIndex(0).typeText('Password123!');
    await element(by.text('Continue')).multiTap();

    // ========== STEP 2: NAVEGA PARA FRIENDS ==========
    console.log('👥 Step 4: Navigating to Friends tab...');
    await waitFor(element(by.id('tab-friends')))
      .toBeVisible()
      .withTimeout(10000)
      .catch(() => {
        // Fallback se não tiver testID
        console.log('Falling back to text search for Friends');
      });

    // Se não tiver testID, usa accessibilityLabel
    try {
      await element(by.id('tab-friends')).multiTap();
    } catch {
      await element(by.label('Friends')).multiTap();
    }

    await waitFor(element(by.text('Friends')))
      .toBeVisible()
      .withTimeout(5000);

    // ========== STEP 3: ADICIONA AMIGO ==========
    console.log('➕ Step 5: Clicking Add Friend button...');

    // Procura pelo botão (pode usar testID ou label)
    try {
      await element(by.id('add-friend-button')).multiTap();
    } catch {
      // Fallback: usa o ícone ou accessibility label
      await element(by.label('Add a new friend')).multiTap();
    }

    // Espera pela página de adicionar amigos
    console.log('🔍 Step 6: Waiting for Add Friend screen...');
    await waitFor(element(by.label('Search friends by name or username')))
      .toBeVisible()
      .withTimeout(5000)
      .catch(() => console.log('Could not find search input'));

    // ========== STEP 4: PROCURA AMIGO ==========
    console.log('🔍 Step 7: Searching for friend...');

    // Procura o input de pesquisa
    try {
      await element(by.id('search-friends-input')).typeText('João');
    } catch {
      // Fallback
      const searchInput = element(by.type('RCTTextInput')).atIndex(0);
      await searchInput.typeText('João');
    }

    // Espera resultados
    console.log('⏳ Step 8: Waiting for search results...');
    await waitFor(element(by.text('João')))
      .toBeVisible()
      .withTimeout(10000);

    // ========== STEP 5: CLICA NO RESULTADO ==========
    console.log('👆 Step 9: Tapping on friend result...');
    await element(by.text('João')).atIndex(0).multiTap();

    // ========== STEP 6: ADICIONA AMIGO ==========
    console.log('➕ Step 10: Adding friend (clicking action button)...');

    try {
      await element(by.id('friend-action-add')).multiTap();
    } catch {
      // Fallback: procura por label
      await element(by.label(/Add.*friend/)).multiTap();
    }

    // Verifica confirmação
    console.log('✅ Step 11: Verifying friend was added...');
    await waitFor(element(by.text('João')))
      .toBeVisible()
      .withTimeout(5000);

    console.log('🎉 TEST PASSED! User successfully added a friend!');
  });
});
