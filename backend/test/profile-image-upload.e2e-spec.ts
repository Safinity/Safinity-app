import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { AuthRequiredGuard } from '../src/auth/auth.guards';
import { PrismaService } from '../src/prisma/prisma.service';

type MockUser = {
  id: string;
  clerk_id: string;
  name: string;
  username: string;
  image: string | null;
  role: string;
  email: string;
  emergency_contact: string | null;
  user_tickets: unknown[];
  user_favorites: unknown[];
};

type UpdateUserArgs = {
  where: { id: string };
  data: {
    name?: string;
    username?: string;
    image?: string;
  };
};

type FetchInput = string | URL | { url: string };
type FetchMock = jest.MockedFunction<
  (input: FetchInput, init?: RequestInit) => Promise<Response>
>;

describe('Profile image upload (e2e)', () => {
  let app: INestApplication<App>;
  let fetchMock: FetchMock;
  let capturedUpload: { url: string; options?: RequestInit } | null;
  let capturedUpdateArgs: UpdateUserArgs | null;
  const originalEnv = process.env;

  const mockUser: MockUser = {
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
      findUnique: jest.fn<(args?: unknown) => Promise<MockUser | null>>(),
      findFirst: jest.fn<(args?: unknown) => Promise<MockUser | null>>(),
      update: jest.fn<(args: UpdateUserArgs) => Promise<MockUser>>(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    capturedUpload = null;
    capturedUpdateArgs = null;

    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://example-project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key',
      SUPABASE_PROFILE_BUCKET: 'safinity',
    };

    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockImplementation((args: UpdateUserArgs) => {
      capturedUpdateArgs = args;
      return Promise.resolve({
        ...mockUser,
        image:
          'https://example-project.supabase.co/storage/v1/object/public/safinity/User/Profile/old.jpg',
      });
    });
    prismaMock.users.findUnique.mockResolvedValue({
      ...mockUser,
      image:
        'https://example-project.supabase.co/storage/v1/object/public/safinity/User/Profile/new.jpg',
    });

    const mockFetchImplementation = (input: FetchInput, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      capturedUpload = { url, options: init };

      return Promise.resolve(new Response('', { status: 200 }));
    };
    fetchMock = jest.fn(mockFetchImplementation);
    global.fetch = fetchMock;

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

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(capturedUpload).not.toBeNull();

    expect(capturedUpload?.url).toMatch(
      /^https:\/\/example-project\.supabase\.co\/storage\/v1\/object\/safinity\/User\/Profile\/b72c7959-12fc-4eb5-af57-a18ee73c37e4-\d+\.jpg$/,
    );
    expect(capturedUpload?.options?.method).toBe('POST');
    expect(capturedUpload?.options?.headers).toMatchObject({
      apikey: 'service-role-test-key',
      Authorization: 'Bearer service-role-test-key',
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    });

    expect(prismaMock.users.update).toHaveBeenCalledTimes(1);
    expect(capturedUpdateArgs).not.toBeNull();

    expect(capturedUpdateArgs?.where).toEqual({ id: mockUser.id });
    expect(capturedUpdateArgs?.data).toMatchObject({
      name: 'Andre Dora',
      username: 'andredora',
    });
    expect(capturedUpdateArgs?.data.image).toMatch(
      /^https:\/\/example-project\.supabase\.co\/storage\/v1\/object\/public\/safinity\/User\/Profile\/b72c7959-12fc-4eb5-af57-a18ee73c37e4-\d+\.jpg$/,
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
