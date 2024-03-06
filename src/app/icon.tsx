import { Logo } from '@/components/icons/logo';
import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'black',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="#fff"
            d="M22 11.71C21.37 9.74 19 6 14.5 6a10.44 10.44 0 00-6.31 2.37 6.64 6.64 0 00-.9-.68 4.62 4.62 0 00-4.84 0 1 1 0 00-.45.82A5.43 5.43 0 003.42 12 5.43 5.43 0 002 15.49a1 1 0 00.45.83 4.6 4.6 0 004.84 0 5.4 5.4 0 00.9-.67A10.44 10.44 0 0014.5 18c4.5 0 6.87-3.74 7.5-5.71a1.14 1.14 0 000-.58z"
          />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    },
  );
}
