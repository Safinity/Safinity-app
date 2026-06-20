import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { AuthRequiredGuard } from '../src/auth/auth.guards';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Profile image upload (e2e)', () => {
  let app: INestApplication<App>;
  const originalEnv = process.env;

  const mockUser = {
    id: 'b72c7959-12fc-4eb5-af57-a18ee73c37e4',
    clerk_id: 'user_test',
    name: 'Andre Dora',
    username: 'andredora',
    image: null,
    role: 'user',
    email: 'andre@example.com',
    emergency_contact: null,
    user_tickets: [],
    user_favorites: [],
  };

  const prismaMock = {
    users: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://example-project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key',
      SUPABASE_PROFILE_BUCKET: 'safinity',
    };

    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({
      ...mockUser,
      image:
        'https://example-project.supabase.co/storage/v1/object/public/safinity/User/Profile/old.jpg',
    });
    prismaMock.users.findUnique.mockResolvedValue({
      ...mockUser,
      image:
        'https://example-project.supabase.co/storage/v1/object/public/safinity/User/Profile/new.jpg',
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(''),
    }) as unknown as typeof fetch;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideGuard(AuthRequiredGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => {
            getRequest: () => {
              user?: {
                id: string;
                clerk_id: string;
                email: string;
                role: string;
              };
            };
          };
        }) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: mockUser.id,
            clerk_id: mockUser.clerk_id,
            email: mockUser.email,
            role: mockUser.role,
          };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('uploads the selected profile image to Supabase Storage and stores the public URL', async () => {
    const imageBase64 = Buffer.from('fake-profile-image').toString('base64');

    const response = await request(app.getHttpServer())
      .patch('/users/me/edit-profile')
      .send({
        name: 'Andre Dora',
        username: 'andredora',
        imageBase64,
        imageMimeType: 'image/jpeg',
      })
      .expect(200);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(
        /^https:\/\/example-project\.supabase\.co\/storage\/v1\/object\/safinity\/User\/Profile\/b72c7959-12fc-4eb5-af57-a18ee73c37e4-\d+\.jpg$/,
      ),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          apikey: 'service-role-test-key',
          Authorization: 'Bearer service-role-test-key',
          'Content-Type': 'image/jpeg',
          'x-upsert': 'true',
        }),
      }),
    );

    expect(prismaMock.users.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          name: 'Andre Dora',
          username: 'andredora',
          image: expect.stringMatching(
            /^https:\/\/example-project\.supabase\.co\/storage\/v1\/object\/public\/safinity\/User\/Profile\/b72c7959-12fc-4eb5-af57-a18ee73c37e4-\d+\.jpg$/,
          ),
        }),
      }),
    );

    expect(response.body).toEqual(
      expect.objectContaining({
        id: mockUser.id,
        image:
          'https://example-project.supabase.co/storage/v1/object/public/safinity/User/Profile/new.jpg',
      }),
    );
  });
});
