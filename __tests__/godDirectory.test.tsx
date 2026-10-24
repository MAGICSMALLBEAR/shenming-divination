import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Image: (props: object) => React.createElement(View, props) };
});

import { GodDirectorySheet } from '@/components/GodDirectorySheet';
import { gods } from '@/data/gods';
import { filterGods } from '@/services/godFilter';
import { buildGodDirectory, GOD_DIRECTORY_GROUPS } from '@/services/godDirectory';

describe('buildGodDirectory', () => {
  it('groups every god by type when showing all, keeping each god exactly once', () => {
    const directory = buildGodDirectory(gods, 'all');
    const listed = directory.sections.flatMap((section) => section.gods.map((god) => god.id));

    expect(directory.title).toBe('全部神明');
    expect(directory.total).toBe(gods.length);
    expect(listed.sort((a, b) => a - b)).toEqual(gods.map((god) => god.id).sort((a, b) => a - b));
    expect(directory.sections.map((section) => section.key)).toEqual(
      GOD_DIRECTORY_GROUPS.map((group) => group.id).filter((id) => gods.some((god) => god.category === id))
    );
  });

  it('covers every deity category so no god falls out of the directory', () => {
    const grouped = new Set(GOD_DIRECTORY_GROUPS.map((group) => group.id));
    expect(gods.filter((god) => !grouped.has(god.category))).toEqual([]);
  });

  it('keeps the selector order inside a group', () => {
    const reversed = [...gods].reverse();
    const heaven = buildGodDirectory(reversed, 'all').sections.find((section) => section.key === 'heaven')!;
    const expected = reversed.filter((god) => god.category === 'heaven').map((god) => god.id);
    expect(heaven.gods.map((god) => god.id)).toEqual(expected);
  });

  it('lists a question category as one titled list of exactly the visible gods', () => {
    const visible = filterGods(gods, '', 'wealth');
    const directory = buildGodDirectory(visible, 'wealth');

    expect(directory.title).toBe('財運投資');
    expect(directory.total).toBe(visible.length);
    expect(directory.sections).toHaveLength(1);
    expect(directory.sections[0].gods).toEqual(visible);
  });

  it('returns no sections when nothing matches', () => {
    expect(buildGodDirectory([], 'love')).toEqual({ title: '感情姻緣', total: 0, sections: [] });
    expect(buildGodDirectory([], 'all').sections).toEqual([]);
  });
});

describe('GodDirectorySheet', () => {
  it('shows group headings for all gods and jumps on a name press', async () => {
    const onJump = jest.fn();
    const view = await render(
      <GodDirectorySheet visible gods={gods} categoryId="all" onClose={jest.fn()} onJump={onJump} />
    );

    expect(view.getByText(`全部神明・${gods.length} 位`)).toBeTruthy();
    expect(view.getByText(/天界星君/)).toBeTruthy();
    await fireEvent.press(view.getByLabelText('前往媽祖'));
    expect(onJump).toHaveBeenCalledWith(gods.find((god) => god.name === '媽祖')!.id);
  });

  it('drops group headings inside a single category and explains an empty result', async () => {
    const visible = filterGods(gods, '', 'wealth');
    const view = await render(
      <GodDirectorySheet visible gods={visible} categoryId="wealth" onClose={jest.fn()} onJump={jest.fn()} />
    );
    expect(view.getByText(`財運投資・${visible.length} 位`)).toBeTruthy();
    expect(view.queryByText(/天界星君/)).toBeNull();

    const empty = await render(
      <GodDirectorySheet visible gods={[]} categoryId="love" onClose={jest.fn()} onJump={jest.fn()} />
    );
    expect(empty.getByText('目前的搜尋與分類沒有符合的神明。')).toBeTruthy();
  });

  it('closes from the close button', async () => {
    const onClose = jest.fn();
    const view = await render(
      <GodDirectorySheet visible gods={gods} categoryId="all" onClose={onClose} onJump={jest.fn()} />
    );
    await fireEvent.press(view.getAllByLabelText('關閉神明名冊').at(-1)!);
    expect(onClose).toHaveBeenCalled();
  });
});
